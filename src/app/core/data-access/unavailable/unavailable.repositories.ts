import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import type { Dashboard } from '../../models/dashboard';
import type { Goal, GoalSummary } from '../../models/goal';
import type { GoalTree } from '../../models/goal-node';
import { AtlasDataError } from '../data-error';
import { DashboardRepository } from '../ports/dashboard.repository';
import { GoalRepository } from '../ports/goal.repository';

function unavailable<T>(): Observable<T> {
  return throwError(
    () => new AtlasDataError('The Atlas service is not connected yet (F4-1).', 'unavailable'),
  );
}

/**
 * Production stand-in until the HTTP adapters land (F4-1). Every call fails, so pages show their Error state and
 * the production bundle carries no sample data.
 */
@Injectable()
export class UnavailableDashboardRepository extends DashboardRepository {
  dashboard(): Observable<Dashboard> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableGoalRepository extends GoalRepository {
  list(): Observable<readonly GoalSummary[]> {
    return unavailable();
  }

  get(): Observable<Goal> {
    return unavailable();
  }

  tree(): Observable<GoalTree> {
    return unavailable();
  }
}
