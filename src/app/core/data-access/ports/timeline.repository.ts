import type { Observable } from 'rxjs';
import type { Timeline, TimelineQuery } from '../../models/timeline';

/** Port for `GET /api/v1/timeline` (API-CONTRACT §9.7), the Journey Overview read model. */
export abstract class TimelineRepository {
  abstract timeline(query?: TimelineQuery): Observable<Timeline>;
}
