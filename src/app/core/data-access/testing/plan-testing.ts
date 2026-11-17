import { HttpBackend } from '@angular/common/http';
import { LOCALE_ID, type EnvironmentProviders, type Provider } from '@angular/core';
import { ATLAS_HTTP_RETRY } from '../http/api-config';
import { HttpGoalRepository } from '../http/http-goal.repository';
import {
  HttpAwardRepository,
  HttpConnectionRepository,
  HttpDashboardRepository,
  HttpOnboardingRepository,
  HttpTimelineRepository,
} from '../http/http-read.repositories';
import { provideAtlasHttp } from '../http/provide-atlas-http';
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
import { FakeAtlasApi } from './fake-atlas-api';

export { MOCK_LATENCY_MS } from '../mock/mock-responder';
export { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS } from '../mock/sample-plan';
export type { MockMode };
export { FakeAtlasApi };

/** Which adapter serves the ports: the in-memory mock, or the HTTP adapters against {@link FakeAtlasApi}. */
export type TestAdapter = 'mock' | 'http';

/** Both adapters, for `describe.each(TEST_ADAPTERS)`: gate 8 runs the same specs against each. */
export const TEST_ADAPTERS: readonly TestAdapter[] = ['mock', 'http'];

/**
 * Spec-only providers: the adapters of every port in the given mock mode, so page and store specs render the §10.5
 * sample without importing `mock/**` themselves. With `adapter: 'http'` the ports use the production HTTP adapters,
 * the real interceptor (retries off, so timing matches the mock) and {@link FakeAtlasApi} as the backend. Application
 * code never imports this file, so it never reaches a bundle.
 */
export function providePlanTesting(
  mode: MockMode = 'sample',
  adapter: TestAdapter = 'mock',
): (Provider | EnvironmentProviders)[] {
  const shared: Provider[] = [
    { provide: MockResponder, useFactory: () => Object.assign(new MockResponder(), { mode }) },
    { provide: LOCALE_ID, useValue: 'en-US' },
  ];
  if (adapter === 'http') {
    return [
      ...shared,
      provideAtlasHttp(),
      FakeAtlasApi,
      { provide: HttpBackend, useExisting: FakeAtlasApi },
      { provide: ATLAS_HTTP_RETRY, useValue: { count: 0, delayMs: 0 } },
      { provide: GoalRepository, useExisting: HttpGoalRepository },
      { provide: DashboardRepository, useExisting: HttpDashboardRepository },
      { provide: TimelineRepository, useExisting: HttpTimelineRepository },
      { provide: ConnectionRepository, useExisting: HttpConnectionRepository },
      { provide: AwardRepository, useExisting: HttpAwardRepository },
      { provide: OnboardingRepository, useExisting: HttpOnboardingRepository },
    ];
  }
  return [
    ...shared,
    { provide: GoalRepository, useExisting: MockGoalRepository },
    { provide: DashboardRepository, useExisting: MockDashboardRepository },
    { provide: TimelineRepository, useExisting: MockTimelineRepository },
    { provide: ConnectionRepository, useExisting: MockConnectionRepository },
    { provide: AwardRepository, useExisting: MockAwardRepository },
    { provide: OnboardingRepository, useExisting: MockOnboardingRepository },
  ];
}
