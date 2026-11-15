import type { Dashboard, DashboardGoal, KeyDate } from '../../../core/models/dashboard';
import type { NodeType } from '../../../core/models/goal-node';
import type { Progress } from '../../../core/models/progress';
import { statusForNode } from '../../../core/models/status-for-node';
import { lifeDimensionByApiKey } from '../../../shared/design-system/life-dimensions';
import type { LifeDimensionKey } from '../../../shared/design-system/tokens.generated';
import type { NextWaypointVm } from '../../../shared/ui/next-waypoint-card/next-waypoint-card';
import { formatPlannedDate, precisionLabel } from '../../../shared/utils/planned-date-format';
import { percentValue, progressDetail } from '../../../shared/utils/progress-format';

/**
 * Display model for My Atlas (Figma page 05). Built from the dashboard response by formatting only: every number is
 * a backend value, never re-derived here (frontend.md §6.3).
 */
export interface AtlasOverviewVm {
  readonly today: { readonly datetime: string; readonly text: string };
  readonly sample: boolean;
  readonly destination: {
    readonly title: string;
    readonly dimensionLabel: string;
    readonly percent: number;
    readonly percentText: string;
    readonly detail: string | undefined;
  };
  readonly achievedText: string;
  readonly nextWaypoint: NextWaypointVm | null;
  readonly glance: readonly GlanceRow[];
  readonly dimensions: readonly DimensionVm[];
  readonly recent: readonly RecentVm[];
  readonly inProgress: readonly string[];
  readonly timing: string | null;
  readonly progressCaption: string;
  readonly policyCaption: string | null;
  /** Short summary shown beside the error when a refresh fails (page 05 Error). */
  readonly savedLines: readonly string[];
}

export interface GlanceRow {
  readonly value: string;
  readonly label: string;
}

export interface DimensionVm {
  readonly key: LifeDimensionKey;
  readonly destinations: number;
  readonly progress: number | null;
}

export interface RecentVm {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
}

export interface OverviewFormatOptions {
  readonly locale: string;
  readonly sample: boolean;
}

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  MILESTONE: 'Waypoint',
  CHECKPOINT: 'Checkpoint',
  TASK: 'Step',
};

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

function keyDateText(keyDate: KeyDate, locale: string): string {
  if (!keyDate.date) {
    return `${keyDate.title} · date not set`;
  }
  const formatted = formatPlannedDate(keyDate.date, locale, 'long');
  const precision = precisionLabel(keyDate.date.precision);
  return [keyDate.title, formatted?.text ?? keyDate.date.date, precision]
    .filter(Boolean)
    .join(' · ');
}

function progressCaption(
  goal: DashboardGoal,
  achieved: number,
  sample: boolean,
  percent: Intl.NumberFormat,
): string {
  const parts: string[] = [];
  const detail = progressDetail(goal.progress);
  const goalPercent = percent.format(percentValue(goal.progress) / 100);
  parts.push(
    `${sample ? 'Sample progress' : 'Progress'}: ${detail ? `${detail} Steps complete (${goalPercent})` : goalPercent}.`,
  );
  const next = goal.nextNode;
  const nextDetail = progressDetail(next?.progress);
  if (next?.progress && nextDetail) {
    parts.push(
      `${next.title}: ${nextDetail} Steps complete (${percent.format(percentValue(next.progress) / 100)}).`,
    );
  }
  parts.push(`${achieved} ${plural(achieved, 'Waypoint', 'Waypoints')} achieved.`);
  return parts.join(' ');
}

function savedLines(
  goal: DashboardGoal,
  summary: Dashboard['summary'],
  percent: Intl.NumberFormat,
  locale: string,
): string[] {
  const lines: string[] = [];
  const goalPercent = percent.format(percentValue(goal.progress) / 100);
  const detail = progressDetail(goal.progress);
  lines.push(detail ? `${goalPercent} · ${detail} Steps complete` : goalPercent);
  const next = goal.nextNode;
  if (next) {
    const date = next.dueDate ? formatPlannedDate(next.dueDate, locale, 'long')?.text : undefined;
    lines.push(`Next: ${next.title} · ${date ?? 'date not set'}`);
    const nextDetail = progressDetail(next.progress);
    if (next.progress && nextDetail) {
      lines.push(
        `${percent.format(percentValue(next.progress) / 100)} · ${nextDetail} Steps of ${next.title}`,
      );
    }
  }
  const { activeGoals: active, achievedWaypoints: achieved } = summary;
  lines.push(
    `${active} active ${plural(active, 'Destination', 'Destinations')} · ${achieved} ${plural(achieved, 'Waypoint', 'Waypoints')} achieved`,
  );
  return lines;
}

function policyCaption(progress: Progress): string | null {
  const excluded = progress.excludedNodes ?? [];
  if (excluded.length === 0) {
    return null;
  }
  const titles = excluded.map((node) => node.title).join(', ');
  return `${titles} ${plural(excluded.length, 'is', 'are')} excluded from progress. Progress reflects completed Steps.`;
}

/** Maps a dashboard with at least one active Destination; callers show the Empty state otherwise. */
export function toAtlasOverviewVm(
  dashboard: Dashboard,
  options: OverviewFormatOptions,
): AtlasOverviewVm {
  const { locale, sample } = options;
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
  const goal = dashboard.activeGoals[0];
  const dimension = lifeDimensionByApiKey(goal.primaryAreaKey);
  const achieved = dashboard.summary.achievedWaypoints;
  const active = dashboard.summary.activeGoals;
  const today = formatPlannedDate({ date: dashboard.today, precision: 'DAY' }, locale, 'long') ?? {
    datetime: dashboard.today,
    text: dashboard.today,
  };
  const next = goal.nextNode;
  const deadline = dashboard.upcomingDeadlines[0];
  const deadlineText = deadline
    ? formatPlannedDate(deadline.dueDate, locale, 'long')?.text
    : undefined;

  return {
    today,
    sample,
    destination: {
      title: goal.title,
      dimensionLabel: dimension?.label ?? goal.primaryAreaKey,
      percent: percentValue(goal.progress),
      percentText: percent.format(percentValue(goal.progress) / 100),
      detail: progressDetail(goal.progress),
    },
    achievedText: `${achieved} ${plural(achieved, 'Waypoint', 'Waypoints')} achieved`,
    nextWaypoint: next
      ? {
          id: next.id,
          title: next.title,
          dimension: dimension?.key ?? 'career',
          status: statusForNode({ status: next.status, availability: next.availability }),
          plannedDate: next.dueDate,
          progress: next.progress
            ? { value: percentValue(next.progress), detail: progressDetail(next.progress) }
            : null,
          link: '/waypoints',
        }
      : null,
    glance: [
      { value: String(active), label: plural(active, 'Active destination', 'Active destinations') },
      {
        value: String(achieved),
        label: plural(achieved, 'Waypoint achieved', 'Waypoints achieved'),
      },
      { value: deadlineText ?? 'Not set', label: 'Next planned deadline' },
    ],
    dimensions: dashboard.lifeBalance.flatMap((entry) => {
      const meta = lifeDimensionByApiKey(entry.areaKey);
      return meta
        ? [
            {
              key: meta.key,
              destinations: entry.activeGoals,
              progress: entry.progress ? percentValue(entry.progress) : null,
            },
          ]
        : [];
    }),
    recent: dashboard.recentAchievements.map((item) => ({
      id: item.nodeId,
      kind: `Completed · ${NODE_TYPE_LABEL[item.nodeType]}`,
      title: item.title,
    })),
    inProgress: dashboard.inProgress.map((item) => `${item.title} · In progress`),
    timing: goal.keyDates.length
      ? `${goal.keyDates.map((date) => keyDateText(date, locale)).join('. ')}.`
      : null,
    progressCaption: progressCaption(goal, achieved, sample, percent),
    policyCaption: policyCaption(goal.progress),
    savedLines: savedLines(goal, dashboard.summary, percent, locale),
  };
}
