import type { Observable } from 'rxjs';
import type { Dashboard } from '../../models/dashboard';

/** Port for `GET /api/v1/dashboard` (frontend.md §6.1). Provided by `provideAtlasData()`. */
export abstract class DashboardRepository {
  abstract dashboard(): Observable<Dashboard>;
}
