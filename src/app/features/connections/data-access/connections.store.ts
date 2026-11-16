import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ConnectionRepository, GoalRepository } from '../../../core/data-access/ports';
import { readModel } from '../../../core/data-access/read-model';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';

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
}
