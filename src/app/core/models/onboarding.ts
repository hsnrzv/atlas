import type { IsoInstant } from './planned-date';
import type { IkigaiAreaKey } from './life-dimension';

/** `GET /api/v1/onboarding` (API-CONTRACT §9.3). */
export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type OnboardingStepStatus = 'NOT_STARTED' | 'COMPLETED' | 'SKIPPED';

/**
 * Step keys. Figma's setup asks for focus areas first, so the contract adds `areas` (FQ-17) to `preferences`,
 * `personal-context` and `financial-baseline`.
 */
export type OnboardingStepKey = 'areas' | 'preferences' | 'personal-context' | 'financial-baseline';

export interface OnboardingStep {
  readonly key: OnboardingStepKey;
  readonly status: OnboardingStepStatus;
}

export interface Onboarding {
  readonly status: OnboardingStatus;
  readonly steps: readonly OnboardingStep[];
  readonly completedAt: IsoInstant | null;
}

/** FQ-17 payload of `PUT /api/v1/onboarding/steps/areas`. */
export interface OnboardingAreas {
  readonly areaKeys: readonly IkigaiAreaKey[];
}
