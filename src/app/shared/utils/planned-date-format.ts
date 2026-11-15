import type { PlannedDate } from '../../core/models/planned-date';

export type PlannedDateStyle = 'short' | 'long';

export interface FormattedPlannedDate {
  /** Value for `<time datetime>`, as precise as the source and no more. */
  readonly datetime: string;
  readonly text: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(
  locale: string,
  key: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const id = `${locale}|${key}`;
  let format = formatters.get(id);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    formatters.set(id, format);
  }
  return format;
}

/**
 * Formats a `PlannedDate` without adding precision it does not have (project-instruction §10.5): a MONTH date
 * reads "Dec 2026" (`short`) or "December 2026" (`long`), never a day. Returns `null` for a malformed date.
 */
export function formatPlannedDate(
  value: PlannedDate,
  locale: string,
  style: PlannedDateStyle = 'short',
): FormattedPlannedDate | null {
  const match = ISO_DATE.exec(value.date);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  // UTC keeps a date-only value on the same calendar day in every time zone.
  const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const dayText = () =>
    formatter(locale, `day-${style}`, { dateStyle: style === 'long' ? 'long' : 'medium' }).format(
      utc,
    );
  switch (value.precision) {
    case 'YEAR':
      return { datetime: year, text: year };
    case 'QUARTER':
      return { datetime: year, text: `Q${Math.floor((Number(month) - 1) / 3) + 1} ${year}` };
    case 'MONTH':
      return {
        datetime: `${year}-${month}`,
        text: formatter(locale, `month-${style}`, { month: style, year: 'numeric' }).format(utc),
      };
    case 'APPROXIMATE':
      return { datetime: value.date, text: `Around ${dayText()}` };
    default:
      return { datetime: value.date, text: dayText() };
  }
}

const PRECISION_LABELS: Record<PlannedDate['precision'], string | null> = {
  DAY: null,
  MONTH: 'month precision',
  QUARTER: 'quarter precision',
  YEAR: 'year precision',
  APPROXIMATE: 'approximate',
};

/** Plain-language precision ("month precision") so a coarse date is never read as exact (Figma page 05). */
export function precisionLabel(precision: PlannedDate['precision']): string | null {
  return PRECISION_LABELS[precision];
}
