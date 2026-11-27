import type { GoalId, GoalStatus } from './goal';
import type { NodeId, NodeStatus, NodeType } from './goal-node';
import type { IkigaiAreaKey } from './life-dimension';
import type { IsoDate, PlannedDate } from './planned-date';
import type { Progress } from './progress';

/** Filters of `GET /api/v1/timeline` (API-CONTRACT §9.7). `from`/`to` bound the planned date, inclusive. */
export interface TimelineQuery {
  readonly from?: IsoDate;
  readonly to?: IsoDate;
  readonly goalId?: GoalId;
  readonly nodeType?: NodeType;
}

/**
 * One Destination (`nodeId: null`) or Waypoint/Step on the Journey (API-CONTRACT §9.7: "flat list of dated
 * goals/nodes with precision, status, area and parent references").
 */
export interface TimelineItem {
  readonly goalId: GoalId;
  readonly goalTitle: string;
  readonly nodeId: NodeId | null;
  readonly parentId: NodeId | null;
  readonly nodeType: NodeType | null;
  readonly title: string;
  readonly status: NodeStatus | GoalStatus;
  readonly areaKey: IkigaiAreaKey;
  /** FQ-14: `null` for items without a planned date, so "Not placed yet" needs no second request. */
  readonly date: PlannedDate | null;
  /** FQ-14: backend progress of the item, as on the node. */
  readonly progress: Progress | null;
}

export interface Timeline {
  /** Dated items in date order, then undated items in plan order (FQ-14). */
  readonly items: readonly TimelineItem[];
}
