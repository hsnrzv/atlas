import type { Observable } from 'rxjs';
import type { Goal, GoalId, GoalSummary } from '../../models/goal';
import type { GoalTree } from '../../models/goal-node';

/**
 * Port for `/api/v1/goals` (frontend.md §6.1). Write operations (create, update, complete, …) join with the features
 * that need them (F3-1, F3-2, F4-3).
 */
export abstract class GoalRepository {
  abstract list(): Observable<readonly GoalSummary[]>;
  abstract get(goalId: GoalId): Observable<Goal>;
  abstract tree(goalId: GoalId): Observable<GoalTree>;
}
