import type { GoalId, GoalStatus } from './goal';
import type { NodeId, NodeStatus, NodeType } from './goal-node';
import type { IkigaiAreaKey } from './life-dimension';
import type { IsoDate, PlannedDate } from './planned-date';

/**
 * Fields of `POST /api/v1/goals` and `PATCH /api/v1/goals/{goalId}` that the Destination form edits (API-CONTRACT
 * §9.5, Figma page 06 form). Only `title` is required by the contract. `reward` maps to `PUT …/reward` (`null`
 * removes it).
 */
export interface GoalDraft {
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly primaryAreaKey: IkigaiAreaKey;
  readonly status: GoalStatus;
  readonly targetDate: PlannedDate | null;
  readonly reward: string | null;
}

export type GoalSort = 'targetDate' | 'title' | 'updatedAt';

/** Query parameters of `GET /api/v1/goals` (API-CONTRACT §9.5). */
export interface GoalQuery {
  readonly q?: string;
  readonly status?: GoalStatus;
  readonly area?: IkigaiAreaKey;
  readonly targetFrom?: IsoDate;
  readonly targetTo?: IsoDate;
  readonly sort?: GoalSort;
}

/** Fields of `POST /api/v1/goals/{goalId}/nodes` (API-CONTRACT §9.6). */
export interface NodeDraft {
  readonly parentId: NodeId | null;
  readonly nodeType: NodeType;
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly dueDate: PlannedDate | null;
}

/** Work states the user may set with `PATCH`; COMPLETED goes through `…/complete` (API-CONTRACT §9.6). */
export type SettableNodeStatus = Exclude<NodeStatus, 'COMPLETED'>;

/** `PATCH /api/v1/goals/{goalId}/nodes/{nodeId}`: any subset; `parentId` + `sortOrder` move the node. */
export interface NodePatch {
  readonly title?: string;
  readonly outcome?: string | null;
  readonly description?: string | null;
  readonly dueDate?: PlannedDate | null;
  readonly status?: SettableNodeStatus;
  readonly parentId?: NodeId | null;
  readonly sortOrder?: number;
}

/** A `prerequisite → dependent` edge inside one goal (`/goals/{goalId}/dependencies`, API-CONTRACT §9.6). */
export interface GoalDependency {
  readonly id: string;
  readonly goalId: GoalId;
  readonly prerequisiteNodeId: NodeId;
  readonly dependentNodeId: NodeId;
}
