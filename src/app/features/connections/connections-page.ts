import { Component, computed, inject, input, LOCALE_ID, signal, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import type { IkigaiAreaKey } from '../../core/models/life-dimension';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDimensionBadge } from '../../shared/ui/badge/dimension-badge';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { AtlasConnectionGraph } from '../../shared/visualization/connection-graph/connection-graph';
import { ConnectionsStore } from './data-access/connections.store';
import {
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
  private readonly graph = viewChild(AtlasConnectionGraph);
  private readonly defaultView: ConnectionsView = wideScreen() ? 'graph' : 'list';

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
