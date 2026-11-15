import type { Provider } from '@angular/core';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import {
  UnavailableDashboardRepository,
  UnavailableGoalRepository,
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
  ];
}
