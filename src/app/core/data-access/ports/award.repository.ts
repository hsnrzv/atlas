import type { Observable } from 'rxjs';
import type { AwardItem, Awards } from '../../models/awards';

/**
 * Port for Milestone Awards: the `GET /api/v1/rewards` read model (API-CONTRACT §9.7a, FQ-16) and
 * `POST …/reward/redeem` (API-CONTRACT §9.6), which only accepts an `EARNED` reward.
 */
export abstract class AwardRepository {
  abstract awards(): Observable<Awards>;
  abstract redeem(reward: AwardItem): Observable<AwardItem>;
}
