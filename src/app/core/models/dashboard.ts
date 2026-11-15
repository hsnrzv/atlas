import type { GoalId, GoalReward } from './goal';
import type { NodeAvailability, NodeId, NodeStatus, NodeType } from './goal-node';
import type { IkigaiAreaKey } from './life-dimension';
import type { IsoDate, IsoInstant, PlannedDate } from './planned-date';
import type { Progress } from './progress';

/**
 * `GET /api/v1/dashboard`: the read-only "My Atlas" view model (API-CONTRACT §9.1).
 *
 * Fields marked "Proposed" are not in the draft contract yet. Figma page 05 shows them, and only the backend can
 * derive them (roadmap R-12), so they are raised as contract questions FQ-1 … FQ-6 in frontend.md §6.5 instead of
 * being computed in the browser.
 */
export interface Dashboard {
  readonly today: IsoDate;
  readonly focus: DashboardFocus | null;
  readonly lifeBalance: readonly LifeBalanceEntry[];
  readonly activeGoals: readonly DashboardGoal[];
  readonly upcomingDeadlines: readonly UpcomingDeadline[];
  /** `null` until backend Phase 6. */
  readonly moneySnapshot: null;
  /** `null` until backend Phase 6. */
  readonly timeCapacity: null;
  readonly recentAchievements: readonly RecentAchievement[];
  /** Proposed (FQ-4): Steps currently in progress, newest first. */
  readonly inProgress: readonly DashboardNodeRef[];
  /** Proposed (FQ-3): totals for "At a glance". */
  readonly summary: DashboardSummary;
}

export interface DashboardFocus {
  readonly goalId: GoalId;
  readonly nodeId: NodeId;
  readonly title: string;
  readonly reason: string;
}

export interface LifeBalanceEntry {
  readonly areaKey: IkigaiAreaKey;
  readonly label: string;
  readonly activeGoals: number;
  /** Proposed (FQ-2): area progress; `null` when the area has no active Destination. */
  readonly progress: Progress | null;
}

export interface DashboardGoal {
  readonly id: GoalId;
  readonly title: string;
  readonly primaryAreaKey: IkigaiAreaKey;
  readonly progress: Progress;
  readonly nextNode: DashboardNextNode | null;
  readonly targetDate: PlannedDate | null;
  readonly reward: GoalReward | null;
  /** Proposed (FQ-3): completed Waypoints of this Destination. */
  readonly achievedWaypoints: number;
  /** Proposed (FQ-6): later Waypoints with their planned date (`null` = not set yet), in plan order. */
  readonly keyDates: readonly KeyDate[];
}

/**
 * The next Waypoint. The draft contract has `{ id, title }`; the rest is proposed (FQ-1) so the Next Waypoint card
 * can show status, lock state, planned date and progress without a second request.
 */
export interface DashboardNextNode {
  readonly id: NodeId;
  readonly title: string;
  readonly nodeType: NodeType;
  readonly status: NodeStatus;
  readonly availability: Pick<NodeAvailability, 'state'>;
  readonly dueDate: PlannedDate | null;
  readonly progress: Progress | null;
}

export interface UpcomingDeadline {
  readonly goalId: GoalId;
  readonly nodeId: NodeId;
  readonly title: string;
  readonly dueDate: PlannedDate;
}

export interface RecentAchievement {
  readonly goalId: GoalId;
  readonly nodeId: NodeId;
  readonly title: string;
  readonly completedAt: IsoInstant;
  /** Proposed (FQ-4): tells a Step from a Waypoint. */
  readonly nodeType: NodeType;
}

export interface DashboardNodeRef {
  readonly goalId: GoalId;
  readonly nodeId: NodeId;
  readonly title: string;
  readonly nodeType: NodeType;
}

export interface DashboardSummary {
  readonly activeGoals: number;
  readonly achievedWaypoints: number;
}

export interface KeyDate {
  readonly nodeId: NodeId;
  readonly title: string;
  readonly date: PlannedDate | null;
}
