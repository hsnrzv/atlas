import type { GoalId, GoalReward } from './goal';
import type { NodeAvailability, NodeId, NodeStatus, NodeType } from './goal-node';
import type { IkigaiAreaKey } from './life-dimension';
import type { IsoDate, IsoInstant, PlannedDate } from './planned-date';
import type { Progress } from './progress';

/**
 * `GET /api/v1/dashboard`: the read-only "My Atlas" view model (API-CONTRACT §9.1).
 *
 * Figma page 05 also needs fields only the backend can derive (roadmap R-12). They were raised as FQ-1 … FQ-6
 * (frontend.md §6.5), accepted by the backend for Phase 3, and are never computed in the browser.
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
  /** FQ-4: Steps currently in progress, newest first. */
  readonly inProgress: readonly DashboardNodeRef[];
  /** FQ-3: totals for "At a glance". */
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
  /** FQ-2: area progress; `null` when the area has no active Destination with measurable progress. */
  readonly progress: Progress | null;
}

export interface DashboardGoal {
  readonly id: GoalId;
  readonly title: string;
  readonly primaryAreaKey: IkigaiAreaKey;
  /** `null` when there is nothing to measure (API-CONTRACT §9.1). */
  readonly progress: Progress | null;
  readonly nextNode: DashboardNextNode | null;
  readonly targetDate: PlannedDate | null;
  readonly reward: GoalReward | null;
  /** FQ-3: completed Waypoints of this Destination. */
  readonly achievedWaypoints: number;
  /** FQ-6: open top-level Waypoints with their planned date (`null` = not set yet), in plan order. */
  readonly keyDates: readonly KeyDate[];
}

/**
 * The next Waypoint (FQ-1): status, lock state, planned date and progress, so the Next Waypoint card needs no second
 * request.
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
  /** FQ-4: tells a Step from a Waypoint. */
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
