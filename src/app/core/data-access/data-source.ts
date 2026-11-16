import type { Provider } from '@angular/core';
import { AwardRepository } from './ports/award.repository';
import { ConnectionRepository } from './ports/connection.repository';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { OnboardingRepository } from './ports/onboarding.repository';
import { TimelineRepository } from './ports/timeline.repository';
import {
  UnavailableAwardRepository,
  UnavailableConnectionRepository,
  UnavailableDashboardRepository,
  UnavailableGoalRepository,
  UnavailableOnboardingRepository,
  UnavailableTimelineRepository,
} from './unavailable/unavailable.repositories';

/**
 * Production data source. `angular.json` swaps this file for `data-source.development.ts` in development builds,
 * so the production bundle never references `mock/**` (frontend.md §6.2). The HTTP adapters replace the
 * unavailable ones in F4-1.
 */
export function dataSourceProviders(): Provider[] {
  return [
    { provide: DashboardRepository, useClass: UnavailableDashboardRepository },
    { provide: GoalRepository, useClass: UnavailableGoalRepository },
    { provide: TimelineRepository, useClass: UnavailableTimelineRepository },
    { provide: ConnectionRepository, useClass: UnavailableConnectionRepository },
    { provide: AwardRepository, useClass: UnavailableAwardRepository },
    { provide: OnboardingRepository, useClass: UnavailableOnboardingRepository },
  ];
}
