import { inject, type Provider, type Type } from '@angular/core';
import { ATLAS_ENVIRONMENT } from '../config/atlas-environment';
import { MockAwardRepository } from './mock/mock-award.repository';
import { MockConnectionRepository } from './mock/mock-connection.repository';
import { MockDashboardRepository } from './mock/mock-dashboard.repository';
import { MockGoalRepository } from './mock/mock-goal.repository';
import { MockOnboardingRepository } from './mock/mock-onboarding.repository';
import { MockPlanState } from './mock/mock-plan-state';
import { MockTimelineRepository } from './mock/mock-timeline.repository';
import { SAMPLE_GOAL_DRAFT } from './mock/sample-plan';
import { AwardRepository } from './ports/award.repository';
import { ConnectionRepository } from './ports/connection.repository';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { OnboardingRepository } from './ports/onboarding.repository';
import { TimelineRepository } from './ports/timeline.repository';
import { ATLAS_SAMPLE_DATA } from './sample-data';
import { ATLAS_SAMPLE_GOAL_DRAFT } from './sample-goal-draft';
import { ATLAS_SAMPLE_PLAN_LOADER } from './sample-plan-loader';
import {
  UnavailableAwardRepository,
  UnavailableConnectionRepository,
  UnavailableDashboardRepository,
  UnavailableGoalRepository,
  UnavailableOnboardingRepository,
  UnavailableTimelineRepository,
} from './unavailable/unavailable.repositories';

const useMock = () => inject(ATLAS_ENVIRONMENT).dataSource === 'mock';

/** Binds `port` to the mock adapter when the mock is active, otherwise to the unavailable one. */
function port<T>(token: abstract new () => T, mock: Type<T>, unavailable: Type<T>): Provider[] {
  return [
    unavailable,
    { provide: token, useFactory: () => (useMock() ? inject(mock) : inject(unavailable)) },
  ];
}

/**
 * Development data source (replaces `data-source.ts` through `angular.json` `fileReplacements`). Serves the
 * single §10.5 sample when `environment.dataSource` is `'mock'`.
 */
export function dataSourceProviders(): Provider[] {
  return [
    { provide: ATLAS_SAMPLE_DATA, useFactory: useMock },
    { provide: ATLAS_SAMPLE_GOAL_DRAFT, useFactory: () => (useMock() ? SAMPLE_GOAL_DRAFT : null) },
    {
      provide: ATLAS_SAMPLE_PLAN_LOADER,
      useFactory: () => {
        if (!useMock()) {
          return null;
        }
        const state = inject(MockPlanState);
        return () => state.seedSample();
      },
    },
    ...port(DashboardRepository, MockDashboardRepository, UnavailableDashboardRepository),
    ...port(GoalRepository, MockGoalRepository, UnavailableGoalRepository),
    ...port(TimelineRepository, MockTimelineRepository, UnavailableTimelineRepository),
    ...port(ConnectionRepository, MockConnectionRepository, UnavailableConnectionRepository),
    ...port(AwardRepository, MockAwardRepository, UnavailableAwardRepository),
    ...port(OnboardingRepository, MockOnboardingRepository, UnavailableOnboardingRepository),
  ];
}
