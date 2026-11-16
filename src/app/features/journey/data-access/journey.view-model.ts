import type { Dashboard } from '../../../core/models/dashboard';
import type { IkigaiAreaKey } from '../../../core/models/life-dimension';
import type { IsoDate } from '../../../core/models/planned-date';
import type { Timeline, TimelineItem } from '../../../core/models/timeline';
import { destinationLink, waypointLink } from '../../../core/layout/plan-links';
import { statusForNode } from '../../../core/models/status-for-node';
import type { NodeStatus } from '../../../core/models/goal-node';
import { lifeDimensionByApiKey } from '../../../shared/design-system/life-dimensions';
import { ATLAS_STATUSES, type AtlasStatusKey } from '../../../shared/design-system/statuses';
import type { LifeDimensionKey } from '../../../shared/design-system/tokens.generated';
import type { NextWaypointVm } from '../../../shared/ui/next-waypoint-card/next-waypoint-card';
import { excludedText } from '../../../shared/utils/plan-format';
import { formatPlannedDate, precisionLabel } from '../../../shared/utils/planned-date-format';
import { formatPercent, percentValue, progressDetail } from '../../../shared/utils/progress-format';
import {
  journeyScale,
  type JourneyRange,
  type JourneyScale,
} from '../../../shared/visualization/journey-timeline/journey-scale';
import type { JourneyLane } from '../../../shared/visualization/journey-timeline/journey-timeline';

export interface AgendaItemVm {
  readonly id: string;
  /** Backend ISO date, for "Today" to find the first item from this month on. */
  readonly iso: IsoDate;
  readonly date: { readonly datetime: string; readonly text: string };
  readonly title: string;
  readonly line: string;
  readonly status: AtlasStatusKey;
  readonly link: string;
}

export interface UnplacedVm {
  readonly id: string;
  readonly title: string;
  readonly line: string;
  readonly link: string;
}

export interface JourneyGroupVm {
  readonly goalId: string;
  readonly title: string;
  readonly link: string;
  readonly progress: { readonly value: number; readonly label: string; readonly detail?: string };
  readonly caption: string;
  readonly lanes: readonly JourneyLane[];
  readonly agenda: readonly AgendaItemVm[];
  readonly unplaced: readonly UnplacedVm[];
  readonly excluded: string | null;
  readonly next: NextWaypointVm | null;
}

export interface JourneyVm {
  readonly today: { readonly date: IsoDate; readonly label: string };
  readonly description: string;
  readonly scale: JourneyScale;
  readonly groups: readonly JourneyGroupVm[];
  readonly dimensionOptions: readonly { readonly value: IkigaiAreaKey; readonly label: string }[];
  /** Destinations exist but the dimension filter hides all of them. */
  readonly filteredOut: boolean;
}

export interface JourneyInput {
  readonly range: JourneyRange;
  readonly dashboard: Dashboard;
  readonly timeline: Timeline;
}

const STATUS_LABELS = new Map(ATLAS_STATUSES.map((status) => [status.key, status.label]));
const SHORT_PRECISION: Record<string, string> = {
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  APPROXIMATE: 'approx.',
};

const isWaypoint = (item: TimelineItem) => item.nodeId !== null && item.nodeType !== 'TASK';
const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function statusOf(item: TimelineItem): AtlasStatusKey {
  return statusForNode({ status: item.status as NodeStatus });
}

function lane(item: TimelineItem, locale: string): JourneyLane | null {
  const date = item.date!;
  const short = formatPlannedDate(date, locale, 'short');
  const long = formatPlannedDate(date, locale, 'long');
  if (!short || !long) {
    return null;
  }
  const precision = precisionLabel(date.precision);
  const status = STATUS_LABELS.get(statusOf(item));
  return {
    id: item.nodeId!,
    label: item.title,
    date: date.date,
    caption: SHORT_PRECISION[date.precision]
      ? `${short.text} · ${SHORT_PRECISION[date.precision]}`
      : short.text,
    marker: date.precision === 'DAY' || date.precision === 'MONTH' ? 'solid' : 'dashed',
    dimension: lifeDimensionByApiKey(item.areaKey)?.key ?? 'career',
    link: waypointLink(item.goalId, item.nodeId!),
    accessibleName: [item.title, long.text, precision, status].filter(Boolean).join(', '),
  };
}

function agendaItem(item: TimelineItem, locale: string): AgendaItemVm | null {
  const date = formatPlannedDate(item.date!, locale, 'long');
  if (!date) {
    return null;
  }
  const precision = precisionLabel(item.date!.precision);
  const detail = progressDetail(item.progress);
  const progress = item.progress
    ? `${formatPercent(item.progress, locale)}${detail ? ` · ${detail} steps` : ''}`
    : null;
  return {
    id: item.nodeId!,
    iso: item.date!.date,
    date,
    title: item.title,
    line: [precision ? capitalise(precision) : null, progress].filter(Boolean).join(' · '),
    status: statusOf(item),
    link: waypointLink(item.goalId, item.nodeId!),
  };
}

function nextWaypoint(
  dashboard: Dashboard,
  goalId: string,
  dimension: LifeDimensionKey,
): NextWaypointVm | null {
  const next = dashboard.activeGoals.find((goal) => goal.id === goalId)?.nextNode;
  return next
    ? {
        id: next.id,
        title: next.title,
        dimension,
        status: statusForNode({ status: next.status, availability: next.availability }),
        plannedDate: next.dueDate,
        progress: next.progress
          ? { value: percentValue(next.progress), detail: progressDetail(next.progress) }
          : null,
        link: waypointLink(goalId, next.id),
      }
    : null;
}

function group(
  goalId: string,
  items: readonly TimelineItem[],
  dashboard: Dashboard,
  locale: string,
): JourneyGroupVm {
  const destination = items.find((item) => item.nodeId === null);
  const summary = dashboard.activeGoals.find((goal) => goal.id === goalId);
  const progress = destination?.progress ?? summary?.progress ?? null;
  const detail = progressDetail(progress);
  const percent = formatPercent(progress, locale);
  const waypoints = items.filter(isWaypoint);
  const dated = waypoints.filter((item) => item.date);
  const dimension = lifeDimensionByApiKey(items[0].areaKey)?.key ?? 'career';
  const parts = [
    detail ? `${detail} steps completed` : null,
    summary
      ? `${summary.achievedWaypoints} ${plural(summary.achievedWaypoints, 'Waypoint', 'Waypoints')} achieved`
      : null,
  ].filter(Boolean);
  return {
    goalId,
    title: destination?.title ?? items[0].goalTitle,
    link: destinationLink(goalId),
    progress: {
      value: percentValue(progress),
      label: 'Destination progress',
      detail: detail ? `${percent} · ${detail}` : percent,
    },
    caption: parts.join(' · '),
    lanes: dated.flatMap((item) => lane(item, locale) ?? []),
    agenda: dated.flatMap((item) => agendaItem(item, locale) ?? []),
    unplaced: waypoints
      .filter((item) => !item.date)
      .map((item) => ({
        id: item.nodeId!,
        title: item.title,
        line: `${STATUS_LABELS.get(statusOf(item))} · Date not set · Not placed`,
        link: waypointLink(item.goalId, item.nodeId!),
      })),
    excluded: excludedText(progress),
    next: nextWaypoint(dashboard, goalId, dimension),
  };
}

/** Maps the backend timeline to the Journey page; `dimension` filters what is shown, never what is counted. */
export function toJourneyVm(
  input: JourneyInput,
  dimension: IkigaiAreaKey | null,
  locale: string,
  sample: boolean,
): JourneyVm {
  const { dashboard, timeline, range } = input;
  const today = formatPlannedDate({ date: dashboard.today, precision: 'DAY' }, locale, 'short');
  const todayLong = formatPlannedDate({ date: dashboard.today, precision: 'DAY' }, locale, 'long');
  const visible = timeline.items.filter((item) => !dimension || item.areaKey === dimension);

  const goalIds = [...new Set(visible.map((item) => item.goalId))];
  const groups = goalIds.map((goalId) =>
    group(
      goalId,
      visible.filter((item) => item.goalId === goalId),
      dashboard,
      locale,
    ),
  );
  const dates = groups.flatMap((item) => item.lanes.map((entry) => entry.date));

  return {
    today: { date: dashboard.today, label: `Today · ${today?.text ?? dashboard.today}` },
    description: sample
      ? `Sample plan · ${todayLong?.text ?? dashboard.today}`
      : 'Your Waypoints over time, at the precision you planned them.',
    scale: journeyScale(range, dashboard.today, dates, locale),
    groups,
    dimensionOptions: [...new Set(timeline.items.map((item) => item.areaKey))].flatMap((value) => {
      const meta = lifeDimensionByApiKey(value);
      return meta ? [{ value, label: meta.label }] : [];
    }),
    filteredOut: timeline.items.length > 0 && visible.length === 0,
  };
}
