import type { Provider } from '@angular/core';
import { HttpGoalRepository } from './http/http-goal.repository';
import {
  HttpAwardRepository,
  HttpConnectionRepository,
  HttpDashboardRepository,
  HttpOnboardingRepository,
  HttpTimelineRepository,
} from './http/http-read.repositories';
import { AwardRepository } from './ports/award.repository';
import { ConnectionRepository } from './ports/connection.repository';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { OnboardingRepository } from './ports/onboarding.repository';
import { TimelineRepository } from './ports/timeline.repository';

/**
 * Production data source: the HTTP adapters (F4-1). `angular.json` swaps this file for `data-source.development.ts`
 * in development builds, so the production bundle never references `mock/**` (frontend.md §6.2).
 */
export function dataSourceProviders(): Provider[] {
  return [
    { provide: DashboardRepository, useExisting: HttpDashboardRepository },
    { provide: GoalRepository, useExisting: HttpGoalRepository },
    { provide: TimelineRepository, useExisting: HttpTimelineRepository },
    { provide: ConnectionRepository, useExisting: HttpConnectionRepository },
    { provide: AwardRepository, useExisting: HttpAwardRepository },
    { provide: OnboardingRepository, useExisting: HttpOnboardingRepository },
  ];
}
