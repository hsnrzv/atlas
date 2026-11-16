import { Component, computed, inject, input, LOCALE_ID, signal, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import type { IkigaiAreaKey } from '../../core/models/life-dimension';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDimensionBadge } from '../../shared/ui/badge/dimension-badge';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { AtlasConnectionGraph } from '../../shared/visualization/connection-graph/connection-graph';
import { openRelationshipDialog } from './components/relationship-dialog/relationship-dialog';
import { ConnectionsStore } from './data-access/connections.store';
import {
  connectRequest,
  dimensionNodeId,
  selectedLabel,
  selectedRelationships,
  toConnectionsVm,
  type ConnectionsFilters,
  type RelationshipFilter,
} from './data-access/connections.view-model';

export type ConnectionsView = 'graph' | 'list';

const ZOOM_LEVELS = [1, 1.25, 1.5, 2] as const;
const RELATIONSHIPS: readonly { value: RelationshipFilter; label: string }[] = [
  { value: 'all', label: 'All relationships' },
  { value: 'association', label: 'Associations' },
  { value: 'impact', label: 'Possible impacts' },
];

const wideScreen = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(min-width: 768px)').matches;

/** Connections (F2-9, Figma page 09): how each Destination relates to Life Dimensions, as a graph or a list. */
@Component({
  selector: 'atlas-connections-page',
  imports: [
    AtlasConnectionGraph,
    AtlasDimensionBadge,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasPageHeader,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  templateUrl: './connections-page.html',
  styleUrl: './connections-page.scss',
})
export class ConnectionsPage {
  // Bound from the query string (withComponentInputBinding).
  readonly selected = input<string>();
  readonly view = input<string>();
  readonly relationship = input<string>();
  readonly dimension = input<string>();

  protected readonly store = inject(ConnectionsStore);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(AtlasToast);
  private readonly graph = viewChild(AtlasConnectionGraph);
  private readonly wide = wideScreen();
  private readonly defaultView: ConnectionsView = this.wide ? 'graph' : 'list';

  /** On compact screens the other Destinations are locked while one is selected (owner request 2026-11-16). */
  protected readonly lockSources = !this.wide;

  protected readonly relationshipOptions = RELATIONSHIPS;
  protected readonly zoom = signal<number>(1);

  protected readonly layout = computed<ConnectionsView>(() => {
    const view = this.view();
    return view === 'graph' || view === 'list' ? view : this.defaultView;
  });
  protected readonly filters = computed<ConnectionsFilters>(() => {
    const relationship = this.relationship();
    return {
      relationship: RELATIONSHIPS.some((option) => option.value === relationship)
        ? (relationship as RelationshipFilter)
        : 'all',
      dimension: (this.dimension() as IkigaiAreaKey | undefined) ?? null,
    };
  });
  protected readonly vm = computed(() => {
    const value = this.store.value();
    return value
      ? toConnectionsVm(value.connections, value.goals, this.filters(), this.locale)
      : null;
  });
  protected readonly selectedNode = computed(() => {
    const id = this.selected() ?? null;
    return this.vm()?.nodes.some((node) => node.id === id) ? id : null;
  });
  protected readonly details = computed(() => {
    const vm = this.vm();
    return vm ? selectedRelationships(vm, this.selectedNode()) : [];
  });
  protected readonly detailsLabel = computed(() => {
    const vm = this.vm();
    return vm ? selectedLabel(vm, this.selectedNode()) : null;
  });
  /** Announced while a Destination is selected: the next Life Dimension chosen connects to it. */
  protected readonly connectHint = computed(() => {
    const vm = this.vm();
    const node = vm?.nodes.find((item) => item.id === this.selectedNode());
    return node?.column === 'source'
      ? `Select a Life Dimension to connect ${selectedLabel(vm!, node.id)}. Press Escape to cancel.`
      : '';
  });
  protected readonly description = computed(() =>
    this.store.sample
      ? 'Sample plan · changes stay in this browser session.'
      : 'See how your destination relates to life dimensions.',
  );
  protected readonly canZoomIn = computed(() => this.zoom() < ZOOM_LEVELS.at(-1)!);
  protected readonly canZoomOut = computed(() => this.zoom() > ZOOM_LEVELS[0]);
  protected readonly zoomText = computed(() => `${Math.round(this.zoom() * 100)}%`);

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.store.state);
  }

  protected select(node: string | null): void {
    this.navigate({ selected: node });
  }

  protected async connect(request: { source: string; target: string }): Promise<void> {
    const vm = this.vm();
    const pending = vm ? connectRequest(vm, request.source, request.target) : null;
    if (!pending) {
      return;
    }
    const saved = await openRelationshipDialog(this.dialog, {
      goalTitle: pending.goalTitle,
      dimensionLabel: pending.dimensionLabel,
      save: (weight) => this.store.connect(pending.goalId, pending.areaKey, weight),
    });
    if (saved) {
      this.toast.show(`${pending.goalTitle} is now connected to ${pending.dimensionLabel}.`);
      this.select(request.target);
    }
  }

  protected selectDimension(areaKey: string): void {
    this.select(dimensionNodeId(areaKey));
  }

  protected setView(view: ConnectionsView): void {
    this.navigate({ view });
  }

  protected setRelationship(value: RelationshipFilter): void {
    this.navigate({ relationship: value === 'all' ? null : value, selected: null });
  }

  protected setDimension(value: IkigaiAreaKey | null): void {
    this.navigate({ dimension: value, selected: null });
  }

  protected zoomBy(step: 1 | -1): void {
    const index = ZOOM_LEVELS.indexOf(this.zoom() as (typeof ZOOM_LEVELS)[number]);
    const next = ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + step))];
    this.zoom.set(next);
  }

  protected focusSelection(): void {
    this.graph()?.focusNode(this.selectedNode());
  }

  protected reset(): void {
    this.zoom.set(1);
    this.select(null);
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
