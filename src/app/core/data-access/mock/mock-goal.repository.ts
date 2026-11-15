import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, throwError, of } from 'rxjs';
import type { Goal, GoalId, GoalSummary } from '../../models/goal';
import type { GoalTree } from '../../models/goal-node';
import { AtlasDataError } from '../data-error';
import { GoalRepository } from '../ports/goal.repository';
import { MockResponder } from './mock-responder';
import { SAMPLE_GOAL, SAMPLE_NODES } from './sample-plan';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

function summary(goal: Goal): GoalSummary {
  const { id, title, primaryAreaKey, status, targetDate, progress, nextAvailableNode, reward } =
    goal;
  return { id, title, primaryAreaKey, status, targetDate, progress, nextAvailableNode, reward };
}

function notFound<T>(goalId: GoalId): Observable<T> {
  return throwError(() => new AtlasDataError(`No Destination ${goalId}.`, 'not-found'));
}

/** Dev-only goal adapter (F2-2): the single §10.5 sample. Never referenced by production builds. */
@Injectable({ providedIn: 'root' })
export class MockGoalRepository extends GoalRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);

  list(): Observable<readonly GoalSummary[]> {
    return this.responder.respond(
      'goals',
      () => [summary(SAMPLE_GOAL)],
      () => [],
    );
  }

  get(goalId: GoalId): Observable<Goal> {
    return this.responder
      .respond<Goal | null>(
        `goal:${goalId}`,
        () => (goalId === SAMPLE_GOAL.id ? SAMPLE_GOAL : null),
        () => null,
      )
      .pipe(switchMap((goal) => (goal ? of(goal) : notFound<Goal>(goalId))));
  }

  tree(goalId: GoalId): Observable<GoalTree> {
    return this.responder
      .respond<GoalTree | null>(
        `tree:${goalId}`,
        () => (goalId === SAMPLE_GOAL.id ? { goalId, nodes: SAMPLE_NODES } : null),
        () => null,
      )
      .pipe(switchMap((tree) => (tree ? of(tree) : notFound<GoalTree>(goalId))));
  }
}
