import type { IsoDate } from '../../../core/models/planned-date';

/** Range buttons of the Journey (Figma page 10): months ahead of today, or the whole plan. */
export type JourneyRange = '3m' | '6m' | '1y' | '3y' | 'all';

export const JOURNEY_RANGES: readonly { value: JourneyRange; label: string; name: string }[] = [
  { value: '3m', label: '3m', name: 'Next 3 months' },
  { value: '6m', label: '6m', name: 'Next 6 months' },
  { value: '1y', label: '1y', name: 'Next year' },
  { value: '3y', label: '3y', name: 'Next 3 years' },
  { value: 'all', label: 'All', name: 'Whole plan' },
];

const MONTHS: Record<Exclude<JourneyRange, 'all'>, number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
  '3y': 36,
};
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface JourneyTick {
  readonly date: IsoDate;
  readonly label: string;
  /** Position from the start, 0–100. */
  readonly offset: number;
}

export interface JourneyScale {
  readonly start: IsoDate;
  readonly end: IsoDate;
  readonly ticks: readonly JourneyTick[];
  /** Position of a date from the start, 0–100, clamped to the visible range. */
  offset(date: IsoDate): number;
}

/** Milliseconds since the epoch for a date-only value, in UTC so it never shifts a day. */
export function utcTime(date: IsoDate): number {
  const match = ISO.exec(date);
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : NaN;
}

const iso = (time: number): IsoDate => new Date(time).toISOString().slice(0, 10);

function addMonths(date: IsoDate, months: number): IsoDate {
  const value = new Date(utcTime(date));
  value.setUTCMonth(value.getUTCMonth() + months);
  return iso(value.getTime());
}

const monthStart = (date: IsoDate): IsoDate => `${date.slice(0, 7)}-01`;
const yearStart = (date: IsoDate): IsoDate => `${date.slice(0, 4)}-01-01`;

/**
 * The `from`/`to` query for a range (API-CONTRACT §9.7): from the first of the current month, so this month's
 * Waypoints stay visible, to the given number of months after today. `all` asks for the whole plan.
 */
export function rangeQuery(range: JourneyRange, today: IsoDate): { from?: IsoDate; to?: IsoDate } {
  if (range === 'all') {
    return {};
  }
  return { from: monthStart(today), to: addMonths(today, MONTHS[range]) };
}

/**
 * A linear time scale for drawing only (positions, not progress). A bounded range uses its own bounds; the whole
 * plan spans whole years around today and every dated item.
 */
export function journeyScale(
  range: JourneyRange,
  today: IsoDate,
  dates: readonly IsoDate[],
  locale: string,
): JourneyScale {
  let start: IsoDate;
  let end: IsoDate;
  if (range === 'all') {
    const sorted = [today, ...dates].filter((date) => !Number.isNaN(utcTime(date))).sort();
    start = yearStart(sorted[0]);
    end = `${Number(sorted.at(-1)!.slice(0, 4)) + 1}-01-01`;
  } else {
    const query = rangeQuery(range, today);
    start = query.from!;
    end = query.to!;
  }
  const from = utcTime(start);
  const span = Math.max(1, utcTime(end) - from);
  const offset = (date: IsoDate) =>
    Math.min(100, Math.max(0, ((utcTime(date) - from) / span) * 100));

  const years = span > 18 * 31 * 86_400_000;
  const ticks: JourneyTick[] = [];
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  for (
    let tick = years ? yearStart(start) : monthStart(start);
    tick <= end;
    tick = addMonths(tick, years ? 12 : 1)
  ) {
    if (tick < start) {
      continue;
    }
    const label =
      years || tick.endsWith('-01-01') ? tick.slice(0, 4) : month.format(new Date(utcTime(tick)));
    ticks.push({ date: tick, label, offset: offset(tick) });
  }
  return { start, end, ticks, offset };
}
