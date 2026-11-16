import { InjectionToken } from '@angular/core';

/**
 * Dev-only "Explore sample plan" action of onboarding (Figma page 13, Flow A): replaces the session plan with the
 * §10.5 sample. `null` in production, so the action is not rendered; `data-source.development.ts` provides it when
 * the mock is active.
 */
export const ATLAS_SAMPLE_PLAN_LOADER = new InjectionToken<(() => void) | null>(
  'ATLAS_SAMPLE_PLAN_LOADER',
  { providedIn: 'root', factory: () => null },
);
