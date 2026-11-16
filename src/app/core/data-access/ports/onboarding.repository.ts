import type { Observable } from 'rxjs';
import type { Onboarding, OnboardingAreas } from '../../models/onboarding';

/** Port for `/api/v1/onboarding` (API-CONTRACT §9.3). Every call answers with the whole onboarding state. */
export abstract class OnboardingRepository {
  abstract onboarding(): Observable<Onboarding>;
  /** `PUT /api/v1/onboarding/steps/areas` (FQ-17); `null` skips the step. */
  abstract saveAreas(areas: OnboardingAreas | null): Observable<Onboarding>;
  /** `POST /api/v1/onboarding/complete`, allowed with skipped steps. */
  abstract complete(): Observable<Onboarding>;
  /** `POST /api/v1/onboarding/reopen`, from Settings. */
  abstract reopen(): Observable<Onboarding>;
}
