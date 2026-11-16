import { Component, computed, ElementRef, inject, input, output } from '@angular/core';
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

  readonly selectedChange = output<string | null>();

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

  protected toggle(id: string): void {
    this.selectedChange.emit(this.selected() === id ? null : id);
  }

  /** Scrolls a node into view and focuses it (Figma "Focus"); the first Destination when `id` is unknown. */
  focusNode(id: string | null): void {
    const buttons = [...this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.node')];
    const button = buttons.find((item) => item.dataset['id'] === id) ?? buttons[0];
    button?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    button?.focus();
  }
}
