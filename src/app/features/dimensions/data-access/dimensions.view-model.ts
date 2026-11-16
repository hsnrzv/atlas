import { DESTINATIONS, DIMENSIONS } from '../../../core/layout/navigation';
import { destinationLink, waypointLink } from '../../../core/layout/plan-links';
import type { Dashboard, DashboardGoal } from '../../../core/models/dashboard';
import { LIFE_DIMENSIONS, type LifeDimension } from '../../../shared/design-system/life-dimensions';
import type { LifeDimensionKey } from '../../../shared/design-system/tokens.generated';
import type { AtlasStatusKey } from '../../../shared/design-system/statuses';
import { excludedText, plannedDateText, rewardText } from '../../../shared/utils/plan-format';
import { formatPlannedDate } from '../../../shared/utils/planned-date-format';
import { formatPercent, percentValue, progressDetail } from '../../../shared/utils/progress-format';
import { DIMENSION_COPY } from './dimension-copy';

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export const dimensionLink = (key: LifeDimensionKey): string => `${DIMENSIONS.path}/${key}`;
export const intentionLink = (dimension: LifeDimension) => ({
  path: DESTINATIONS.path,
  query: { create: dimension.apiKey },
});

export interface DimensionCardVm {
  readonly key: LifeDimensionKey;
  readonly label: string;
  readonly destinations: number;
  readonly progress: number | null;
  readonly action: {
    readonly label: string;
    readonly name: string;
    readonly path: string;
    readonly query: Record<string, string> | null;
  };
}

export interface DimensionsVm {
  /** "Sample plan · date · 1 active Destination" in sample mode. */
  readonly meta: string | null;
  readonly cards: readonly DimensionCardVm[];
  readonly summary: string;
}

function sampleLine(dashboard: Dashboard, locale: string, extra: readonly string[]): string {
  const today = formatPlannedDate({ date: dashboard.today, precision: 'DAY' }, locale, 'long');
  const active = dashboard.activeGoals.length;
  return [
    'Sample plan',
    today?.text ?? dashboard.today,
    `${active} active ${plural(active, 'Destination', 'Destinations')}`,
    ...extra,
  ].join(' · ');
}

/** The seven dimension cards in canonical order, with the backend's counts and progress. */
export function toDimensionsVm(
  dashboard: Dashboard,
  locale: string,
  sample: boolean,
): DimensionsVm {
  const cards = LIFE_DIMENSIONS.map((dimension): DimensionCardVm => {
    const entry = dashboard.lifeBalance.find((item) => item.areaKey === dimension.apiKey);
    const count = entry?.activeGoals ?? 0;
    const intention = intentionLink(dimension);
    return {
      key: dimension.key,
      label: dimension.label,
      destinations: count,
      progress: entry?.progress ? percentValue(entry.progress) : null,
      action: count
        ? {
            label: `View ${dimension.label}`,
            name: `View ${dimension.label}`,
            path: dimensionLink(dimension.key),
            query: null,
          }
        : {
            label: 'Add intention',
            name: `Add intention for ${dimension.label}`,
            path: intention.path,
            query: intention.query,
          },
    };
  });
  const active = dashboard.lifeBalance.filter((item) => item.activeGoals > 0);
  const lines = active.map((item) => {
    const label = LIFE_DIMENSIONS.find((d) => d.apiKey === item.areaKey)?.label ?? item.label;
    const percent = item.progress ? ` · ${formatPercent(item.progress, locale)} complete` : '';
    return `${label}: ${item.activeGoals} ${plural(item.activeGoals, 'Destination', 'Destinations')}${percent}.`;
  });
  const rest =
    active.length === 0
      ? 'No dimension has a Destination yet.'
      : active.length < LIFE_DIMENSIONS.length
        ? 'Other dimensions have no Destinations yet.'
        : null;
  return {
    meta: sample ? sampleLine(dashboard, locale, []) : null,
    cards,
    summary: [...lines, rest, 'Add an intention only when it feels meaningful.']
      .filter(Boolean)
      .join(' '),
  };
}

export interface DimensionGoalVm {
  readonly id: string;
  readonly title: string;
  readonly link: string;
  readonly status: AtlasStatusKey;
  readonly progress: { readonly value: number; readonly detail?: string };
  readonly completed: string | null;
  readonly target: string | null;
  readonly achieved: string;
  readonly next: { readonly title: string; readonly line: string; readonly link: string } | null;
  readonly reward: string | null;
}

export interface DimensionDetailVm {
  readonly dimension: LifeDimension;
  readonly description: string;
  readonly meta: string | null;
  readonly prompt: string;
  readonly intention: { readonly path: string; readonly query: Record<string, string> };
  readonly goals: readonly DimensionGoalVm[];
  readonly nextLines: readonly string[];
  readonly caption: string;
}

function goalVm(goal: DashboardGoal, locale: string): DimensionGoalVm {
  const next = goal.nextNode;
  const detail = progressDetail(goal.progress);
  const nextDetail = progressDetail(next?.progress);
  const reward = rewardText(goal.reward);
  return {
    id: goal.id,
    title: goal.title,
    link: destinationLink(goal.id),
    status: 'in-progress',
    progress: { value: percentValue(goal.progress), detail },
    completed: detail ? `${detail} Steps completed` : null,
    target: goal.targetDate ? plannedDateText(goal.targetDate, locale) : null,
    achieved: `${goal.achievedWaypoints} ${plural(goal.achievedWaypoints, 'Waypoint', 'Waypoints')} achieved`,
    next: next
      ? {
          title: next.title,
          line: [
            formatPercent(next.progress, locale),
            nextDetail ? `${nextDetail} Steps` : null,
            next.dueDate ? plannedDateText(next.dueDate, locale) : null,
          ]
            .filter(Boolean)
            .join(' · '),
          link: waypointLink(goal.id, next.id),
        }
      : null,
    reward: reward ? `${reward.title} · ${reward.status}` : null,
  };
}

/** One dimension with its active Destinations; `null` when the key is not a Life Dimension. */
export function toDimensionDetailVm(
  key: string,
  dashboard: Dashboard,
  locale: string,
  sample: boolean,
): DimensionDetailVm | null {
  const dimension = LIFE_DIMENSIONS.find((item) => item.key === key);
  if (!dimension) {
    return null;
  }
  const entry = dashboard.lifeBalance.find((item) => item.areaKey === dimension.apiKey);
  const goals = dashboard.activeGoals.filter((goal) => goal.primaryAreaKey === dimension.apiKey);
  const first = goals[0];
  const next = first?.nextNode;
  const nextDetail = progressDetail(next?.progress);
  const reward = rewardText(first?.reward ?? null);
  return {
    dimension,
    description: DIMENSION_COPY[dimension.key].description,
    meta: sample
      ? sampleLine(
          dashboard,
          locale,
          entry?.progress ? [formatPercent(entry.progress, locale)] : [],
        )
      : null,
    prompt: `${DIMENSION_COPY[dimension.key].prompt} You can add a personal intention when you are ready.`,
    intention: intentionLink(dimension),
    goals: goals.map((goal) => goalVm(goal, locale)),
    nextLines: next
      ? [
          `${next.title} · ${plannedDateText(next.dueDate, locale)}`,
          [nextDetail ? `${nextDetail} Steps complete` : null, formatPercent(next.progress, locale)]
            .filter(Boolean)
            .join(' · '),
          ...first.keyDates.map((item) => `${item.title} · ${plannedDateText(item.date, locale)}`),
        ]
      : [],
    caption: [
      'Progress reflects completed Steps, not a life score.',
      reward ? `Reward: ${reward.title} · ${reward.status}.` : null,
      excludedText(first?.progress ?? null),
    ]
      .filter(Boolean)
      .join(' '),
  };
}
