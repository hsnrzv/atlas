import { inject, type Provider } from '@angular/core';
import { ATLAS_ENVIRONMENT } from '../config/atlas-environment';
import { MockDashboardRepository } from './mock/mock-dashboard.repository';
import { MockGoalRepository } from './mock/mock-goal.repository';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { SAMPLE_GOAL_DRAFT } from './mock/sample-plan';
import { ATLAS_SAMPLE_DATA } from './sample-data';
import { ATLAS_SAMPLE_GOAL_DRAFT } from './sample-goal-draft';
import {
  UnavailableDashboardRepository,
  UnavailableGoalRepository,
} from './unavailable/unavailable.repositories';

const useMock = () => inject(ATLAS_ENVIRONMENT).dataSource === 'mock';

/**
 * Development data source (replaces `data-source.ts` through `angular.json` `fileReplacements`). Serves the
 * single §10.5 sample when `environment.dataSource` is `'mock'`.
 */
export function dataSourceProviders(): Provider[] {
  return [
    { provide: ATLAS_SAMPLE_DATA, useFactory: useMock },
    { provide: ATLAS_SAMPLE_GOAL_DRAFT, useFactory: () => (useMock() ? SAMPLE_GOAL_DRAFT : null) },
    UnavailableDashboardRepository,
    UnavailableGoalRepository,
    {
      provide: DashboardRepository,
      useFactory: () =>
        useMock() ? inject(MockDashboardRepository) : inject(UnavailableDashboardRepository),
    },
    {
      provide: GoalRepository,
      useFactory: () =>
        useMock() ? inject(MockGoalRepository) : inject(UnavailableGoalRepository),
    },
  ];
}
