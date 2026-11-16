import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import { AtlasIcon } from '../../icons/atlas-icon';
import type { AtlasIconName } from '../../icons/atlas-icons';
import { layoutConnectionGraph } from './connection-graph-layout';

export interface ConnectionGraphNode {
  readonly id: string;
  readonly column: 'source' | 'target';
  readonly label: string;
  readonly caption: string;
  readonly icon: AtlasIconName;
  /** Tints a target node with its Life Dimension colour; `null` for Destinations. */
  readonly dimension: LifeDimensionKey | null;
  /**
   * Full accessible name. It starts with the visible label (WCAG 2.5.3) and replaces the truncated visible text for
   * assistive technology, e.g. "Finance, 1 relationship".
   */
  readonly accessibleName: string;
}

export interface ConnectionGraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  /** Solid for an association, dashed for a possible impact; the legend and list say the same in words. */
  readonly line: 'solid' | 'dashed';
}

/**
 * Connections graph (F2-9, Figma page 09 "One destination. Two relationships."): SVG curves under HTML buttons.
 * Every node is a button with `aria-pressed`; the curves are decorative because the list view and the relationship
 * panel say the same in text. `zoom` widens the stage inside a scroll container.
 *
 * With `connectable`, a selected Destination arms a connection: a dashed line follows the mouse, and choosing a
 * Life Dimension it has no association with emits `connectRequest` instead of changing the selection. With
 * `lockSources` (compact screens) the other Destinations are disabled until the selected one is chosen again.
 * Escape clears the selection.
 */
@Component({
  selector: 'atlas-connection-graph',
  imports: [AtlasIcon],
  templateUrl: './connection-graph.html',
  styleUrl: './connection-graph.scss',
})
export class AtlasConnectionGraph {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly nodes = input.required<readonly ConnectionGraphNode[]>();
  readonly edges = input.required<readonly ConnectionGraphEdge[]>();
  readonly selected = input<string | null>(null);
  readonly zoom = input(1);
  readonly label = input('Connections graph');
  readonly connectable = input(false);
  readonly lockSources = input(false);

  readonly selectedChange = output<string | null>();
  readonly connectRequest = output<{ readonly source: string; readonly target: string }>();

  /** Pointer position in viewBox units while a connection is armed; `null` without a mouse or pen over the stage. */
  private readonly pointer = signal<{ readonly x: number; readonly y: number } | null>(null);

  /** The selected Destination when connect mode is on. */
  protected readonly armed = computed(() => {
    const selected = this.selected();
    const node = this.nodes().find((item) => item.id === selected);
    return this.connectable() && node?.column === 'source' ? node.id : null;
  });

  protected readonly pendingPath = computed(() => {
    const armed = this.armed();
    const pointer = this.pointer();
    const { nodes, nodeWidth, nodeHeight } = this.layout();
    const box = nodes.find((item) => item.id === armed);
    if (!box || !pointer) {
      return null;
    }
    const x1 = box.x + nodeWidth;
    const y1 = box.y + nodeHeight / 2;
    const middle = (x1 + pointer.x) / 2;
    return `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${pointer.y}, ${pointer.x} ${pointer.y}`;
  });

  protected readonly layout = computed(() =>
    layoutConnectionGraph(
      this.nodes()
        .filter((node) => node.column === 'source')
        .map((node) => node.id),
      this.nodes()
        .filter((node) => node.column === 'target')
        .map((node) => node.id),
      this.edges(),
    ),
  );

  protected readonly placed = computed(() => {
    const { width, height, nodeWidth, nodeHeight, nodes } = this.layout();
    const byId = new Map(this.nodes().map((node) => [node.id, node]));
    return nodes.map((box) => ({
      node: byId.get(box.id)!,
      left: (box.x / width) * 100,
      top: (box.y / height) * 100,
      width: (nodeWidth / width) * 100,
      height: (nodeHeight / height) * 100,
    }));
  });

  protected readonly paths = computed(() => {
    const lines = new Map(this.edges().map((edge) => [edge.id, edge]));
    const selected = this.selected();
    return this.layout().edges.map((path) => {
      const edge = lines.get(path.id)!;
      return {
        ...path,
        line: edge.line,
        active: selected !== null && (edge.source === selected || edge.target === selected),
      };
    });
  });

  protected isLocked(node: ConnectionGraphNode): boolean {
    const armed = this.armed();
    return this.lockSources() && armed !== null && node.column === 'source' && node.id !== armed;
  }

  protected choose(node: ConnectionGraphNode): void {
    if (this.isLocked(node)) {
      return;
    }
    const armed = this.armed();
    if (armed && node.column === 'target' && !this.associated(armed, node.id)) {
      this.pointer.set(null);
      this.connectRequest.emit({ source: armed, target: node.id });
      return;
    }
    this.selectedChange.emit(this.selected() === node.id ? null : node.id);
  }

  protected track(event: PointerEvent): void {
    if (!this.armed() || event.pointerType === 'touch') {
      return;
    }
    const stage = event.currentTarget as HTMLElement;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const { width, height } = this.layout();
    this.pointer.set({
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    });
  }

  protected untrack(): void {
    this.pointer.set(null);
  }

  protected clear(event: Event): void {
    if (this.selected() !== null) {
      event.preventDefault();
      this.pointer.set(null);
      this.selectedChange.emit(null);
    }
  }

  private associated(source: string, target: string): boolean {
    return this.edges().some(
      (edge) => edge.source === source && edge.target === target && edge.line === 'solid',
    );
  }

  /** Scrolls a node into view and focuses it (Figma "Focus"); the first Destination when `id` is unknown. */
  focusNode(id: string | null): void {
    const buttons = [...this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.node')];
    const button = buttons.find((item) => item.dataset['id'] === id) ?? buttons[0];
    button?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    button?.focus();
  }
}
