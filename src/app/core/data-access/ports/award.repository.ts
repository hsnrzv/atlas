import type { Observable } from 'rxjs';
import type { AwardItem, Awards } from '../../models/awards';

/**
 * Port for Milestone Awards: the proposed `GET /api/v1/rewards` read model (FQ-16) and the contract's
 * `POST …/reward/redeem` (API-CONTRACT §9.6), which only accepts an `EARNED` reward.
 */
export abstract class AwardRepository {
  abstract awards(): Observable<Awards>;
  abstract redeem(reward: AwardItem): Observable<AwardItem>;
}
