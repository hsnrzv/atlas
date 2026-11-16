import { Injectable, inject } from '@angular/core';
import { DashboardRepository } from '../../../core/data-access/ports';
import { readModel } from '../../../core/data-access/read-model';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';

/** Life Dimensions read model (P-D1, Figma page 13): the dashboard's life balance and active Destinations. */
@Injectable()
export class DimensionsStore {
  readonly sample = inject(ATLAS_SAMPLE_DATA);
  private readonly dashboard = inject(DashboardRepository);

  private readonly model = readModel(() => this.dashboard.dashboard());

  readonly value = this.model.value;
  readonly state = this.model.state;
  readonly refreshing = this.model.refreshing;
  readonly enter = this.model.enter;
  readonly retry = this.model.retry;
}
