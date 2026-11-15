import type { GoalId, GoalReward } from './goal';
import type { PlannedDate } from './planned-date';
import type { Progress } from './progress';

/** Domain `GoalNode` = UI "Waypoint" (MILESTONE, CHECKPOINT) or "Step" (TASK) (ADR-0006). */
export type NodeId = string;

export type NodeType = 'MILESTONE' | 'CHECKPOINT' | 'TASK';

/** Stored work status (API-CONTRACT §9.6). Locking is separate: see `NodeAvailability`. */
export type NodeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

/** Derived by the backend from dependencies; never stored as a work status. */
export type AvailabilityState = 'AVAILABLE' | 'LOCKED' | 'OVERRIDDEN';

export interface LockReason {
  readonly prerequisiteNodeId: NodeId;
  readonly title: string;
  readonly status: NodeStatus;
}

export interface NodeAvailability {
  readonly state: AvailabilityState;
  readonly reasons: readonly LockReason[];
  readonly override: { readonly reason: string } | null;
}

/** Minimal reference, e.g. `Goal.nextAvailableNode`. */
export interface GoalNodeRef {
  readonly id: NodeId;
  readonly title: string;
}

/** `GET /api/v1/goals/{goalId}/nodes/{nodeId}` (API-CONTRACT §9.6). */
export interface GoalNode {
  readonly id: NodeId;
  readonly goalId: GoalId;
  readonly parentId: NodeId | null;
  readonly nodeType: NodeType;
  readonly title: string;
  readonly status: NodeStatus;
  readonly startDate: PlannedDate | null;
  readonly dueDate: PlannedDate | null;
  readonly progressWeight: string;
  readonly sortOrder: number;
  readonly availability: NodeAvailability;
  readonly progress: Progress | null;
  readonly reward: GoalReward | null;
  readonly childCount: number;
  readonly version: number;
}

/** `GET /api/v1/goals/{goalId}/tree`: the whole goal tree, flat and ordered by `parentId` + `sortOrder`. */
export interface GoalTree {
  readonly goalId: GoalId;
  readonly nodes: readonly GoalNode[];
}
