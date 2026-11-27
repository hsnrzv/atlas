import type { IkigaiAreaKey } from './life-dimension';
import type { GoalNodeRef } from './goal-node';
import type { IsoInstant, PlannedDate } from './planned-date';
import type { Progress } from './progress';

/** Domain `Goal` = UI "Destination" (ADR-0006). */
export type GoalId = string;

/**
 * Goal lifecycle status (API-CONTRACT §9.5, FQ-8). `ARCHIVED` goals are left out of `GET /goals` unless
 * `status=ARCHIVED` is requested; `archive`/`restore` handle that state.
 */
export type GoalStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

/** The statuses `PATCH /goals/{goalId}` can set (API-CONTRACT §9.5). */
export type SettableGoalStatus = Extract<GoalStatus, 'DRAFT' | 'ACTIVE' | 'PAUSED'>;

export const isSettableGoalStatus = (status: GoalStatus): status is SettableGoalStatus =>
  status === 'DRAFT' || status === 'ACTIVE' || status === 'PAUSED';

/** Agreed scale (API-CONTRACT §9.5, DB-2.2); `null` = not set. */
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type RewardStatus = 'PLANNED' | 'EARNED' | 'REDEEMED';

/** Domain `GoalReward` = UI "Milestone Award". */
export interface GoalReward {
  readonly description: string;
  readonly status: RewardStatus;
}

export interface SecondaryArea {
  readonly areaKey: IkigaiAreaKey;
  /** Optional contribution weight as a decimal string, e.g. `"0.3"` (project-instruction §7; FQ-20). */
  readonly weight: string | null;
}

/** `GET /api/v1/goals/{goalId}` (API-CONTRACT §9.5). */
export interface Goal {
  readonly id: GoalId;
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly primaryAreaKey: IkigaiAreaKey;
  readonly secondaryAreas: readonly SecondaryArea[];
  readonly priority: GoalPriority | null;
  readonly status: GoalStatus;
  readonly startDate: PlannedDate | null;
  readonly targetDate: PlannedDate | null;
  /** `null` when there is nothing to measure; the backend never reports an invented `0 %` (API-CONTRACT §9.5). */
  readonly progress: Progress | null;
  readonly nextAvailableNode: GoalNodeRef | null;
  readonly reward: GoalReward | null;
  readonly expectedWeeklyEffortMinutes: number | null;
  readonly createdAt: IsoInstant;
  readonly updatedAt: IsoInstant;
  readonly version: number;
}

/** List item of `GET /api/v1/goals`. */
export type GoalSummary = Pick<
  Goal,
  | 'id'
  | 'title'
  | 'primaryAreaKey'
  | 'status'
  | 'targetDate'
  | 'progress'
  | 'nextAvailableNode'
  | 'reward'
>;
