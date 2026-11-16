import { Injectable, inject, signal } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { DashboardRepository, TimelineRepository } from '../../../core/data-access/ports';
import { readModel } from '../../../core/data-access/read-model';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';
import {
  rangeQuery,
  type JourneyRange,
} from '../../../shared/visualization/journey-timeline/journey-scale';

/**
 * Journey read model (F2-8, Figma page 10): the backend's `today` and Destinations from the dashboard, then the
 * timeline for the chosen range. The backend filters and orders the items; the page only places them.
 */
@Injectable()
export class JourneyStore {
  readonly sample = inject(ATLAS_SAMPLE_DATA);
  readonly range = signal<JourneyRange>('all');
  private readonly dashboard = inject(DashboardRepository);
  private readonly timeline = inject(TimelineRepository);

  private readonly model = readModel(
    (range: JourneyRange) =>
      this.dashboard
        .dashboard()
        .pipe(
          switchMap((dashboard) =>
            this.timeline
              .timeline(rangeQuery(range, dashboard.today))
              .pipe(map((timeline) => ({ range, dashboard, timeline }))),
          ),
        ),
    () => this.range(),
  );

  readonly value = this.model.value;
  readonly state = this.model.state;
  readonly refreshing = this.model.refreshing;
  readonly enter = this.model.enter;
  readonly retry = this.model.retry;
}
