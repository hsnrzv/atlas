import type { GoalId, RewardStatus } from './goal';
import type { NodeId } from './goal-node';
import type { IkigaiAreaKey } from './life-dimension';
import type { IsoInstant } from './planned-date';
import type { Progress } from './progress';

/**
 * Read model `GET /api/v1/rewards` (API-CONTRACT §9.7a, FQ-16, Figma page 11), unpaginated in `v1`. Redeem goes
 * through the Destination or node (API-CONTRACT §9.6). Domain `GoalReward` = UI "Milestone Award".
 */
export interface Awards {
  readonly summary: AwardsSummary;
  readonly rewards: readonly AwardItem[];
  /** Waypoints the backend reports as achieved, newest first. */
  readonly achievedWaypoints: readonly AchievedWaypoint[];
}

export interface AwardsSummary {
  readonly earned: number;
  readonly planned: number;
  readonly redeemed: number;
}

export interface AwardItem {
  readonly goalId: GoalId;
  /** `null` for the Destination's own reward. */
  readonly nodeId: NodeId | null;
  /** Title of the Destination or Waypoint the reward belongs to. */
  readonly sourceTitle: string;
  readonly areaKey: IkigaiAreaKey;
  readonly description: string;
  readonly status: RewardStatus;
  readonly earnedAt: IsoInstant | null;
  readonly redeemedAt: IsoInstant | null;
}

export interface AchievedWaypoint {
  readonly goalId: GoalId;
  readonly nodeId: NodeId;
  readonly title: string;
  readonly areaKey: IkigaiAreaKey;
  /** `null` when the backend has no completion time (Figma "Completion date: Not provided"). */
  readonly completedAt: IsoInstant | null;
  readonly progress: Progress | null;
}
