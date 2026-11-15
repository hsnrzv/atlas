import { LOCALE_ID, type Provider } from '@angular/core';
import { MockGoalRepository } from '../mock/mock-goal.repository';
import { MockResponder, type MockMode } from '../mock/mock-responder';
import { GoalRepository } from '../ports/goal.repository';

export { MOCK_LATENCY_MS } from '../mock/mock-responder';
export { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS } from '../mock/sample-plan';
export type { MockMode };

/**
 * Spec-only providers: the in-memory plan adapter in the given mode, so page specs render the §10.5 sample without
 * importing `mock/**` themselves. Application code never imports this file, so it never reaches a bundle.
 */
export function providePlanTesting(mode: MockMode = 'sample'): Provider[] {
  return [
    { provide: MockResponder, useFactory: () => Object.assign(new MockResponder(), { mode }) },
    { provide: GoalRepository, useExisting: MockGoalRepository },
    { provide: LOCALE_ID, useValue: 'en-US' },
  ];
}
