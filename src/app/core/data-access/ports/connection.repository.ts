import type { Observable } from 'rxjs';
import type { GoalConnection } from '../../models/connection';

/** Port for the proposed `GET /api/v1/connections` read model (FQ-15). */
export abstract class ConnectionRepository {
  abstract connections(): Observable<readonly GoalConnection[]>;
}
