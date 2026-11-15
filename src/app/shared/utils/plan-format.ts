import type { GoalReward, GoalStatus, RewardStatus } from '../../core/models/goal';
import type { GoalNode, NodeStatus } from '../../core/models/goal-node';
import type { PlannedDate } from '../../core/models/planned-date';
import type { Progress } from '../../core/models/progress';
import { statusForNode, type UiStatus } from '../../core/models/status-for-node';
import { formatPlannedDate, precisionLabel } from './planned-date-format';
import { formatPercent } from './progress-format';

export interface StatusBadgeVm {
  readonly status: UiStatus;
  readonly label?: string;
}

const GOAL_STATUS: Record<GoalStatus, StatusBadgeVm> = {
  ACTIVE: { status: 'in-progress', label: 'Active' },
  DRAFT: { status: 'not-started', label: 'Draft' },
  PAUSED: { status: 'not-started', label: 'Paused' },
};

export const GOAL_STATUS_OPTIONS: readonly { value: GoalStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PAUSED', label: 'Paused' },
];

export const NODE_STATUS_OPTIONS: readonly { value: NodeStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SKIPPED', label: 'Skipped' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

/** A Destination's lifecycle status as a badge; the label always names it. */
export const goalStatusBadge = (status: GoalStatus): StatusBadgeVm => GOAL_STATUS[status];

/** A node's own work status, without availability: Blocked is shown as a separate badge (Figma page 08). */
export const nodeStatusKey = (node: Pick<GoalNode, 'status'>): UiStatus =>
  statusForNode({ status: node.status });

export const isBlocked = (node: Pick<GoalNode, 'availability'>): boolean =>
  node.availability.state === 'LOCKED';

/** UI vocabulary for a node (ADR-0006): MILESTONE and CHECKPOINT are Waypoints, TASK is a Step. */
export const nodeKind = (node: Pick<GoalNode, 'nodeType'>): 'Waypoint' | 'Step' =>
  node.nodeType === 'TASK' ? 'Step' : 'Waypoint';

/** "December 2026 · month precision", "Around 1 Dec 2030 · approximate" or "Date not set". */
export function plannedDateText(date: PlannedDate | null, locale: string): string {
  if (!date) {
    return 'Date not set';
  }
  const formatted = formatPlannedDate(date, locale, 'long');
  if (!formatted) {
    return 'Date not set';
  }
  const precision = precisionLabel(date.precision);
  return precision ? `${formatted.text} · ${precision}` : formatted.text;
}

/** "2 of 5 steps completed" from the backend's counted and total weight; `null` when the backend sent none. */
export function completedText(progress: Progress | null, noun: string): string | null {
  if (progress?.countedWeight === undefined || progress.totalWeight === undefined) {
    return null;
  }
  return `${progress.countedWeight} of ${progress.totalWeight} ${noun} completed`;
}

/** "40% · 2 of 5 steps completed", or just the percentage. */
export function progressLine(progress: Progress | null, locale: string, noun: string): string {
  const percent = formatPercent(progress, locale);
  const detail = completedText(progress, noun);
  return detail ? `${percent} · ${detail}` : percent;
}

const REWARD_STATUS: Record<RewardStatus, string> = {
  PLANNED: 'Planned reward · not earned',
  EARNED: 'Reward earned',
  REDEEMED: 'Reward redeemed',
};

/** Reward copy (Figma page 06): the description and whether it is earned; the backend decides when it is. */
export function rewardText(reward: GoalReward | null): { title: string; status: string } | null {
  return reward ? { title: reward.description, status: REWARD_STATUS[reward.status] } : null;
}

/** "Optional reading is excluded from progress." from the backend's `excludedNodes`, or `null`. */
export function excludedText(progress: Progress | null): string | null {
  const excluded = progress?.excludedNodes ?? [];
  if (!excluded.length) {
    return null;
  }
  const titles = excluded.map((node) => node.title).join(', ');
  return `${titles} ${excluded.length === 1 ? 'is' : 'are'} excluded from progress.`;
}
