import type { GoalStatus } from '../../../core/models/goal';
import type { GoalQuery, GoalSort } from '../../../core/models/goal-commands';
import type { IkigaiAreaKey } from '../../../core/models/life-dimension';
import { LIFE_DIMENSIONS } from '../../../shared/design-system/life-dimensions';
import { GOAL_STATUS_OPTIONS } from '../../../shared/utils/plan-format';

export type Timeframe = 'any' | 'this-year' | 'next-year' | 'later';
export type DestinationsView = 'grid' | 'list';

/** Filters of the Destinations overview, as kept in the URL (`?q=&dimension=&status=&timeframe=&sort=`). */
export interface DestinationFilters {
  readonly q: string;
  readonly dimension: IkigaiAreaKey | '';
  readonly status: GoalStatus | '';
  readonly timeframe: Timeframe;
  readonly sort: GoalSort;
}

export const DEFAULT_FILTERS: DestinationFilters = {
  q: '',
  dimension: '',
  status: '',
  timeframe: 'any',
  sort: 'targetDate',
};

export const DIMENSION_OPTIONS: readonly { value: IkigaiAreaKey | ''; label: string }[] = [
  { value: '', label: 'All dimensions' },
  ...LIFE_DIMENSIONS.map((dimension) => ({
    value: dimension.apiKey as IkigaiAreaKey,
    label: dimension.label,
  })),
];

export const STATUS_OPTIONS: readonly { value: GoalStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  ...GOAL_STATUS_OPTIONS,
];

export const TIMEFRAME_OPTIONS: readonly { value: Timeframe; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: 'this-year', label: 'This year' },
  { value: 'next-year', label: 'Next year' },
  { value: 'later', label: 'Later' },
];

export const SORT_OPTIONS: readonly { value: GoalSort; label: string }[] = [
  { value: 'targetDate', label: 'Target date' },
  { value: 'title', label: 'Name' },
  { value: 'updatedAt', label: 'Recently updated' },
];

const pick = <T extends string>(
  options: readonly { value: T }[],
  value: string | undefined,
  fallback: T,
): T => options.find((option) => option.value === value)?.value ?? fallback;

/** Reads filters from route query params; unknown values fall back to the defaults. */
export function parseFilters(
  params: Readonly<Record<string, string | undefined>>,
): DestinationFilters {
  return {
    q: params['q']?.slice(0, 200) ?? '',
    dimension: pick(DIMENSION_OPTIONS, params['dimension'], ''),
    status: pick(STATUS_OPTIONS, params['status'], ''),
    timeframe: pick(TIMEFRAME_OPTIONS, params['timeframe'], 'any'),
    sort: pick(SORT_OPTIONS, params['sort'], 'targetDate'),
  };
}

export const parseView = (value: string | undefined): DestinationsView =>
  value === 'list' ? 'list' : 'grid';

/** Query params for `filters`, leaving defaults out so the URL stays short. */
export function filterParams(filters: DestinationFilters): Record<string, string | null> {
  return {
    q: filters.q || null,
    dimension: filters.dimension || null,
    status: filters.status || null,
    timeframe: filters.timeframe === 'any' ? null : filters.timeframe,
    sort: filters.sort === 'targetDate' ? null : filters.sort,
  };
}

export function isDefault(filters: DestinationFilters): boolean {
  return (
    !filters.q.trim() &&
    !filters.dimension &&
    !filters.status &&
    filters.timeframe === DEFAULT_FILTERS.timeframe
  );
}

/** The `GET /goals` query; the timeframe becomes a target-date range in calendar years. */
export function toGoalQuery(filters: DestinationFilters, year: number): GoalQuery {
  const range: Pick<GoalQuery, 'targetFrom' | 'targetTo'> =
    filters.timeframe === 'this-year'
      ? { targetFrom: `${year}-01-01`, targetTo: `${year}-12-31` }
      : filters.timeframe === 'next-year'
        ? { targetFrom: `${year + 1}-01-01`, targetTo: `${year + 1}-12-31` }
        : filters.timeframe === 'later'
          ? { targetFrom: `${year + 2}-01-01` }
          : {};
  return {
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.dimension ? { area: filters.dimension } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...range,
    sort: filters.sort,
  };
}

/** "2 Destinations · Career · Active", announced after each search. */
export function countText(count: number, filters: DestinationFilters): string {
  const parts = [`${count} ${count === 1 ? 'Destination' : 'Destinations'}`];
  if (filters.dimension) {
    parts.push(DIMENSION_OPTIONS.find((o) => o.value === filters.dimension)?.label ?? '');
  }
  if (filters.status) {
    parts.push(STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? '');
  }
  if (filters.timeframe !== 'any') {
    parts.push(TIMEFRAME_OPTIONS.find((o) => o.value === filters.timeframe)?.label ?? '');
  }
  if (filters.q.trim()) {
    parts.push(`matching “${filters.q.trim()}”`);
  }
  return parts.join(' · ');
}
