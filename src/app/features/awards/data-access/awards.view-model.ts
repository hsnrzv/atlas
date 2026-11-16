import { destinationLink, waypointLink } from '../../../core/layout/plan-links';
import type { AchievedWaypoint, AwardItem, Awards } from '../../../core/models/awards';
import type { Dashboard, DashboardGoal } from '../../../core/models/dashboard';
import type { RewardStatus } from '../../../core/models/goal';
import type { IsoInstant } from '../../../core/models/planned-date';
import { lifeDimensionByApiKey } from '../../../shared/design-system/life-dimensions';
import { plannedDateText } from '../../../shared/utils/plan-format';
import { formatPlannedDate } from '../../../shared/utils/planned-date-format';
import { formatPercent, percentValue, progressDetail } from '../../../shared/utils/progress-format';

export interface AwardsInput {
  readonly awards: Awards;
  readonly dashboard: Dashboard;
}

export interface AwardCardVm {
  readonly key: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly status: string;
  readonly date: string;
  readonly earned: boolean;
  readonly link: string;
  readonly linkLabel: string;
  readonly linkName: string;
  readonly redeemable: boolean;
  readonly item: AwardItem;
}

export interface LinkedDestinationVm {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly link: string;
  readonly progress: string;
  readonly achieved: string;
  readonly keyDates: readonly string[];
}

export interface NextMilestoneVm {
  readonly title: string;
  readonly line: string;
  readonly value: number;
  readonly link: string;
}

export interface HistoryItemVm {
  readonly id: string;
  readonly title: string;
  readonly line: string;
  readonly link: string;
}

export interface CelebrationVm {
  readonly key: string;
  readonly body: string;
  readonly note: string;
  readonly link: string;
}

export interface AwardsVm {
  readonly description: string;
  readonly summary: {
    readonly heading: string;
    readonly planned: string | null;
    readonly message: string;
  };
  readonly awards: readonly AwardCardVm[];
  readonly destinations: readonly LinkedDestinationVm[];
  readonly next: NextMilestoneVm | null;
  readonly history: readonly HistoryItemVm[];
  readonly celebration: CelebrationVm | null;
  /** Nothing to show yet: no reward and no achieved Waypoint. */
  readonly empty: boolean;
}

const EYEBROW: Record<RewardStatus, string> = {
  PLANNED: 'Planned celebration',
  EARNED: 'Earned celebration',
  REDEEMED: 'Celebrated',
};

const STATUS: Record<RewardStatus, string> = {
  PLANNED: 'Planned · not earned',
  EARNED: 'Earned · ready to celebrate',
  REDEEMED: 'Earned · celebrated',
};

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

function dayText(instant: IsoInstant | null, locale: string): string | null {
  return instant
    ? (formatPlannedDate({ date: instant.slice(0, 10), precision: 'DAY' }, locale, 'long')?.text ??
        null)
    : null;
}

function dateLine(item: AwardItem, locale: string): string {
  switch (item.status) {
    case 'PLANNED':
      return 'Celebration date: Not set · not earned';
    case 'EARNED':
      return `Earned: ${dayText(item.earnedAt, locale) ?? 'Date not provided'}`;
    case 'REDEEMED':
      return `Celebrated: ${dayText(item.redeemedAt, locale) ?? 'Date not provided'}`;
  }
}

function awardCard(item: AwardItem, locale: string): AwardCardVm {
  const kind = item.nodeId ? 'Waypoint' : 'Destination';
  const link = item.nodeId ? waypointLink(item.goalId, item.nodeId) : destinationLink(item.goalId);
  return {
    key: `${item.goalId}:${item.nodeId ?? ''}`,
    eyebrow: EYEBROW[item.status],
    title: item.description,
    body:
      item.status === 'PLANNED'
        ? `Celebrate after ${item.nodeId ? 'this Waypoint is achieved' : 'Destination completion'}.`
        : `For ${item.sourceTitle}.`,
    status: STATUS[item.status],
    date: dateLine(item, locale),
    earned: item.status !== 'PLANNED',
    link,
    linkLabel: `View ${kind}`,
    linkName: `View ${kind}: ${item.sourceTitle}`,
    redeemable: item.status === 'EARNED',
    item,
  };
}

function linkedDestination(goal: DashboardGoal, locale: string): LinkedDestinationVm {
  const dimension = lifeDimensionByApiKey(goal.primaryAreaKey);
  const detail = progressDetail(goal.progress);
  const percent = formatPercent(goal.progress, locale);
  return {
    id: goal.id,
    eyebrow: ['Linked Destination', dimension?.label].filter(Boolean).join(' · '),
    title: goal.title,
    link: destinationLink(goal.id),
    progress: ['Active', percent, detail ? `${detail} steps complete` : null]
      .filter(Boolean)
      .join(' · '),
    achieved: `${goal.achievedWaypoints} ${plural(goal.achievedWaypoints, 'Waypoint', 'Waypoints')} achieved.`,
    keyDates: goal.keyDates.map((item) => `${item.title} · ${plannedDateText(item.date, locale)}`),
  };
}

function nextMilestone(goal: DashboardGoal | undefined, locale: string): NextMilestoneVm | null {
  const next = goal?.nextNode;
  if (!goal || !next) {
    return null;
  }
  const detail = progressDetail(next.progress);
  return {
    title: `Next milestone · ${next.title}`,
    line: [detail ? `${detail} steps complete` : null, plannedDateText(next.dueDate, locale)]
      .filter(Boolean)
      .join(' · '),
    value: percentValue(next.progress),
    link: waypointLink(goal.id, next.id),
  };
}

function historyItem(item: AchievedWaypoint, locale: string): HistoryItemVm {
  const dimension = lifeDimensionByApiKey(item.areaKey)?.label;
  const completed = dayText(item.completedAt, locale);
  return {
    id: item.nodeId,
    title: item.title,
    line: [dimension, completed ? `Achieved ${completed}` : 'Completion date: Not provided']
      .filter(Boolean)
      .join(' · '),
    link: waypointLink(item.goalId, item.nodeId),
  };
}

/** Maps the backend's rewards and achieved Waypoints to Milestone Awards; counts and statuses are the backend's. */
export function toAwardsVm(input: AwardsInput, locale: string, sample: boolean): AwardsVm {
  const { awards, dashboard } = input;
  const { summary } = awards;
  const planned = awards.rewards.filter((item) => item.status === 'PLANNED');
  const goalIds = new Set([
    ...awards.rewards.map((item) => item.goalId),
    ...awards.achievedWaypoints.map((item) => item.goalId),
  ]);
  const linked = dashboard.activeGoals.filter((goal) => goalIds.has(goal.id));
  const latest = awards.achievedWaypoints[0];
  const plannedTitles = planned.map((item) => item.description);
  const underway = dashboard.activeGoals.some((goal) => percentValue(goal.progress) > 0);

  return {
    description: sample
      ? `Sample plan · ${dayText(`${dashboard.today}T00:00:00Z`, locale) ?? dashboard.today}`
      : 'Make room for meaningful moments.',
    summary: {
      heading: `${summary.earned} Earned`,
      planned: summary.planned ? `${summary.planned} Planned · ${plannedTitles.join(', ')}` : null,
      message: summary.earned
        ? `${summary.redeemed} of ${summary.earned} earned ${plural(summary.earned, 'award', 'awards')} celebrated.`
        : `${underway ? 'Progress is underway. ' : ''}No Milestone Award has been earned yet.`,
    },
    awards: awards.rewards.map((item) => awardCard(item, locale)),
    destinations: linked.map((goal) => linkedDestination(goal, locale)),
    next: nextMilestone(linked[0] ?? dashboard.activeGoals[0], locale),
    history: awards.achievedWaypoints.map((item) => historyItem(item, locale)),
    celebration: latest
      ? {
          key: `${latest.goalId}:${latest.nodeId}`,
          body: `${latest.title} is complete.`,
          note: [
            'No points.',
            plannedTitles.length
              ? `${plannedTitles.join(', ')} ${plural(plannedTitles.length, 'remains', 'remain')} planned.`
              : null,
          ]
            .filter(Boolean)
            .join(' '),
          link: waypointLink(latest.goalId, latest.nodeId),
        }
      : null,
    empty: !awards.rewards.length && !awards.achievedWaypoints.length,
  };
}
