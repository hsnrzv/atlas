import { computed, inject, Injectable, linkedSignal, LOCALE_ID } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardRepository } from '../../../core/data-access/ports/dashboard.repository';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';
import type { Dashboard } from '../../../core/models/dashboard';
import { toAtlasOverviewVm, type AtlasOverviewVm } from './atlas-overview.view-model';

export type AtlasOverviewState = 'loading' | 'empty' | 'ready' | 'error';

/**
 * State for My Atlas (F2-3b). Provided by the route, so it outlives a visit: coming back shows the last plan at once
 * and refreshes it in the background. If a refresh fails, the last saved plan stays visible beside the error.
 */
@Injectable()
export class AtlasOverviewStore {
  private readonly repository = inject(DashboardRepository);
  private readonly locale = inject(LOCALE_ID);
  private readonly sample = inject(ATLAS_SAMPLE_DATA);
  private visited = false;

  private readonly resource = rxResource({ stream: () => this.repository.dashboard() });

  /** The newest dashboard the backend returned; kept when a later request fails. */
  private readonly lastDashboard = linkedSignal<Dashboard | undefined, Dashboard | undefined>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (next, previous) => next ?? previous?.value,
  });

  readonly state = computed<AtlasOverviewState>(() => {
    if (this.resource.status() === 'error') {
      return 'error';
    }
    const dashboard = this.lastDashboard();
    if (!dashboard) {
      return 'loading';
    }
    return dashboard.activeGoals.length ? 'ready' : 'empty';
  });

  /** Display model of the last saved plan with at least one Destination, if any. */
  readonly overview = computed<AtlasOverviewVm | null>(() => {
    const dashboard = this.lastDashboard();
    return dashboard?.activeGoals.length
      ? toAtlasOverviewVm(dashboard, { locale: this.locale, sample: this.sample })
      : null;
  });

  readonly refreshing = computed(
    () => this.resource.isLoading() && this.lastDashboard() !== undefined,
  );

  /** Called when the page opens: the first visit loads, later visits refresh in the background. */
  enter(): void {
    if (this.visited) {
      this.resource.reload();
    }
    this.visited = true;
  }

  retry(): void {
    this.resource.reload();
  }
}
