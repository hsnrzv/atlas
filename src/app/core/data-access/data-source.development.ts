import { inject, type Provider, type Type } from '@angular/core';
import { ATLAS_ENVIRONMENT } from '../config/atlas-environment';
import { HttpGoalRepository } from './http/http-goal.repository';
import {
  HttpAwardRepository,
  HttpConnectionRepository,
  HttpDashboardRepository,
  HttpOnboardingRepository,
  HttpTimelineRepository,
} from './http/http-read.repositories';
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

const useMock = () => inject(ATLAS_ENVIRONMENT).dataSource === 'mock';

/** Binds `port` to the mock adapter when the mock is active, otherwise to the HTTP adapter (F4-1). */
function port<T>(token: abstract new () => T, mock: Type<T>, http: Type<T>): Provider {
  return { provide: token, useFactory: () => (useMock() ? inject(mock) : inject(http)) };
}

/**
 * Development data source (replaces `data-source.ts` through `angular.json` `fileReplacements`). Serves the
 * single §10.5 sample when `environment.dataSource` is `'mock'`, and talks to the backend through the dev-server
 * proxy (`proxy.conf.json`) when it is `'http'`.
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
    port(DashboardRepository, MockDashboardRepository, HttpDashboardRepository),
    port(GoalRepository, MockGoalRepository, HttpGoalRepository),
    port(TimelineRepository, MockTimelineRepository, HttpTimelineRepository),
    port(ConnectionRepository, MockConnectionRepository, HttpConnectionRepository),
    port(AwardRepository, MockAwardRepository, HttpAwardRepository),
    port(OnboardingRepository, MockOnboardingRepository, HttpOnboardingRepository),
  ];
}
