import { Injectable, inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { isVersionConflict, writeErrorMessage } from '../../../core/data-access/data-error';
import { AwardRepository, DashboardRepository } from '../../../core/data-access/ports';
import { readModel } from '../../../core/data-access/read-model';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';
import type { AwardItem } from '../../../core/models/awards';

/** Milestone Awards read model (P-V2, Figma page 11): the backend's rewards and achieved Waypoints. */
@Injectable()
export class AwardsStore {
  readonly sample = inject(ATLAS_SAMPLE_DATA);
  private readonly awards = inject(AwardRepository);
  private readonly dashboard = inject(DashboardRepository);

  private readonly model = readModel(() =>
    forkJoin({ awards: this.awards.awards(), dashboard: this.dashboard.dashboard() }),
  );

  readonly value = this.model.value;
  readonly state = this.model.state;
  readonly refreshing = this.model.refreshing;
  readonly enter = this.model.enter;
  readonly retry = this.model.retry;

  /** Marks an earned award as celebrated; resolves to `null` when saved, else to the message to show. */
  async redeem(reward: AwardItem): Promise<string | null> {
    try {
      await firstValueFrom(this.awards.redeem(reward));
      this.model.retry();
      return null;
    } catch (error) {
      if (isVersionConflict(error)) {
        this.model.retry();
      }
      return writeErrorMessage(error);
    }
  }
}
