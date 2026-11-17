import { Injectable, inject } from '@angular/core';
import { firstValueFrom, forkJoin, switchMap } from 'rxjs';
import {
  isVersionConflict,
  writeFailure,
  type WriteFailure,
} from '../../../core/data-access/data-error';
import { ConnectionRepository, GoalRepository } from '../../../core/data-access/ports';
import { readModel } from '../../../core/data-access/read-model';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';
import type { GoalId } from '../../../core/models/goal';
import type { IkigaiAreaKey } from '../../../core/models/life-dimension';

/** Connections read model (F2-9, Figma page 09): the backend's relationships plus Destination progress for labels. */
@Injectable()
export class ConnectionsStore {
  readonly sample = inject(ATLAS_SAMPLE_DATA);
  private readonly connections = inject(ConnectionRepository);
  private readonly goals = inject(GoalRepository);

  private readonly model = readModel(() =>
    forkJoin({ connections: this.connections.connections(), goals: this.goals.list() }),
  );

  readonly value = this.model.value;
  readonly state = this.model.state;
  readonly refreshing = this.model.refreshing;
  readonly enter = this.model.enter;
  readonly retry = this.model.retry;

  /**
   * Assigns the Destination to one more Life Dimension: reads the current Destination for its version and secondary
   * dimensions, then patches the list (API-CONTRACT §9.5). Resolves the failure, or `null` after a reload.
   */
  async connect(
    goalId: GoalId,
    areaKey: IkigaiAreaKey,
    weight: string | null,
  ): Promise<WriteFailure | null> {
    try {
      await firstValueFrom(
        this.goals
          .get(goalId)
          .pipe(
            switchMap((goal) =>
              this.goals.setSecondaryAreas(goal.id, goal.version, [
                ...goal.secondaryAreas.filter((area) => area.areaKey !== areaKey),
                { areaKey, weight },
              ]),
            ),
          ),
      );
    } catch (error) {
      if (isVersionConflict(error)) {
        this.model.retry();
      }
      return writeFailure(error);
    }
    this.model.retry();
    return null;
  }
}
