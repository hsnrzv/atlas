import type { Observable } from 'rxjs';
import type { Goal, GoalId, GoalSummary, SecondaryArea } from '../../models/goal';
import type {
  GoalDependency,
  GoalDraft,
  GoalQuery,
  NodeDraft,
  NodePatch,
} from '../../models/goal-commands';
import type { GoalNode, GoalTree, NodeId } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';

/**
 * Port for `/api/v1/goals` (frontend.md §6.1, API-CONTRACT §9.5–§9.6). Writes return the server's resource, and
 * stores replace their state with it; nothing is re-derived in the client. `version` feeds `If-Match`.
 */
export abstract class GoalRepository {
  /** Active Destinations; archived ones are left out (FQ-8). */
  abstract list(query?: GoalQuery): Observable<readonly GoalSummary[]>;
  abstract get(goalId: GoalId): Observable<Goal>;
  abstract tree(goalId: GoalId): Observable<GoalTree>;

  abstract create(draft: GoalDraft): Observable<Goal>;
  abstract update(goalId: GoalId, version: number, draft: GoalDraft): Observable<Goal>;
  /** `PATCH /goals/{goalId}` with `secondaryAreas` (Connections "connect to a Life Dimension"). */
  abstract setSecondaryAreas(
    goalId: GoalId,
    version: number,
    areas: readonly SecondaryArea[],
  ): Observable<Goal>;
  abstract archive(goalId: GoalId): Observable<Goal>;
  /** Permanent deletion (API-CONTRACT A-1); the UI confirms first. */
  abstract remove(goalId: GoalId, version: number): Observable<void>;

  abstract createNode(goalId: GoalId, draft: NodeDraft): Observable<GoalNode>;
  abstract updateNode(
    goalId: GoalId,
    nodeId: NodeId,
    version: number,
    patch: NodePatch,
  ): Observable<GoalNode>;
  /** Deletes the node; `cascade` is required when it has children. */
  abstract removeNode(
    goalId: GoalId,
    nodeId: NodeId,
    version: number,
    cascade: boolean,
  ): Observable<void>;
  /** Fails with `conflict` / `NODE_LOCKED` while a prerequisite is open. */
  abstract completeNode(goalId: GoalId, nodeId: NodeId): Observable<GoalNode>;
  abstract reopenNode(goalId: GoalId, nodeId: NodeId): Observable<GoalNode>;

  abstract dependencies(goalId: GoalId): Observable<readonly GoalDependency[]>;
  /** Same goal only; fails with `conflict` / `DEPENDENCY_CYCLE`. */
  abstract addDependency(
    goalId: GoalId,
    prerequisiteNodeId: NodeId,
    dependentNodeId: NodeId,
  ): Observable<GoalDependency>;
  abstract removeDependency(goalId: GoalId, dependencyId: string): Observable<void>;

  /** Notes of the Destination (`nodeId` null) or of one node. */
  abstract notes(goalId: GoalId, nodeId: NodeId | null): Observable<readonly GoalNote[]>;
  abstract addNote(goalId: GoalId, nodeId: NodeId | null, body: string): Observable<GoalNote>;
  abstract updateNote(goalId: GoalId, noteId: string, body: string): Observable<GoalNote>;
  abstract removeNote(goalId: GoalId, noteId: string): Observable<void>;
}
