import { LOCALE_ID, type Provider } from '@angular/core';
import { MockAwardRepository } from '../mock/mock-award.repository';
import { MockConnectionRepository } from '../mock/mock-connection.repository';
import { MockDashboardRepository } from '../mock/mock-dashboard.repository';
import { MockGoalRepository } from '../mock/mock-goal.repository';
import { MockOnboardingRepository } from '../mock/mock-onboarding.repository';
import { MockResponder, type MockMode } from '../mock/mock-responder';
import { MockTimelineRepository } from '../mock/mock-timeline.repository';
import { AwardRepository } from '../ports/award.repository';
import { ConnectionRepository } from '../ports/connection.repository';
import { DashboardRepository } from '../ports/dashboard.repository';
import { GoalRepository } from '../ports/goal.repository';
import { OnboardingRepository } from '../ports/onboarding.repository';
import { TimelineRepository } from '../ports/timeline.repository';

export { MOCK_LATENCY_MS } from '../mock/mock-responder';
export { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS } from '../mock/sample-plan';
export type { MockMode };

/**
 * Spec-only providers: the in-memory adapters of every port in the given mode, so page specs render the §10.5 sample without
 * importing `mock/**` themselves. Application code never imports this file, so it never reaches a bundle.
 */
export function providePlanTesting(mode: MockMode = 'sample'): Provider[] {
  return [
    { provide: MockResponder, useFactory: () => Object.assign(new MockResponder(), { mode }) },
    { provide: GoalRepository, useExisting: MockGoalRepository },
    { provide: DashboardRepository, useExisting: MockDashboardRepository },
    { provide: TimelineRepository, useExisting: MockTimelineRepository },
    { provide: ConnectionRepository, useExisting: MockConnectionRepository },
    { provide: AwardRepository, useExisting: MockAwardRepository },
    { provide: OnboardingRepository, useExisting: MockOnboardingRepository },
    { provide: LOCALE_ID, useValue: 'en-US' },
  ];
}
