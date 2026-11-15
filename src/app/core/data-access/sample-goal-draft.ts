import { InjectionToken } from '@angular/core';
import type { GoalDraft } from '../models/goal-commands';

/**
 * Values for the dev-only "Use sample details" button in the Destination form (Figma page 06). `null` in production,
 * so the button is not rendered; `data-source.development.ts` provides the §10.5 sample when the mock is active.
 */
export const ATLAS_SAMPLE_GOAL_DRAFT = new InjectionToken<GoalDraft | null>(
  'ATLAS_SAMPLE_GOAL_DRAFT',
  { providedIn: 'root', factory: () => null },
);
