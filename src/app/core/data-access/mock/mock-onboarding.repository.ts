import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Onboarding, OnboardingAreas, OnboardingStep } from '../../models/onboarding';
import { OnboardingRepository } from '../ports/onboarding.repository';
import { mockRead, mockWrite } from './mock-io';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

/** Fixed completion time of the sample user's onboarding. */
const SAMPLE_ONBOARDED_AT = '2026-11-01T08:30:00Z';

/**
 * Dev-only onboarding adapter (F3-4, API-CONTRACT §9.3). `?mock=new` starts a first visit (Flow A); every other
 * mode is a user who finished setup. Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockOnboardingRepository extends OnboardingRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);
  private current: Onboarding =
    this.responder.mode === 'new'
      ? {
          status: 'NOT_STARTED',
          steps: [{ key: 'areas', status: 'NOT_STARTED' }],
          completedAt: null,
        }
      : {
          status: 'COMPLETED',
          steps: [{ key: 'areas', status: 'COMPLETED' }],
          completedAt: SAMPLE_ONBOARDED_AT,
        };
  /** Last saved focus areas, kept for "Run setup again". */
  areas: OnboardingAreas | null = null;

  onboarding(): Observable<Onboarding> {
    return mockRead(this.responder, 'onboarding', () => this.current);
  }

  saveAreas(areas: OnboardingAreas | null): Observable<Onboarding> {
    return mockWrite(this.responder, this.state, () => {
      this.areas = areas;
      return this.set({
        status: this.current.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
        steps: [{ key: 'areas', status: areas ? 'COMPLETED' : 'SKIPPED' }],
      });
    });
  }

  complete(): Observable<Onboarding> {
    return mockWrite(this.responder, this.state, () =>
      this.set({
        status: 'COMPLETED',
        steps: this.current.steps.map((step): OnboardingStep =>
          step.status === 'NOT_STARTED' ? { ...step, status: 'SKIPPED' } : step,
        ),
        completedAt: this.state.now(),
      }),
    );
  }

  reopen(): Observable<Onboarding> {
    return mockWrite(this.responder, this.state, () =>
      this.set({ status: 'IN_PROGRESS', completedAt: null }),
    );
  }

  private set(patch: Partial<Onboarding>): Onboarding {
    this.current = { ...this.current, ...patch };
    return this.current;
  }
}
