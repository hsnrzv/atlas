import { required, type SchemaPathTree } from '@angular/forms/signals';
import type { DatePrecision, PlannedDate } from '../../core/models/planned-date';

export type PrecisionChoice = DatePrecision | '';

/** Form model for a `PlannedDate`: a precision ('' = Not set) and any ISO day inside the period. */
export interface PlannedDateModel {
  precision: PrecisionChoice;
  date: string;
}

export const PRECISION_OPTIONS: readonly { value: PrecisionChoice; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'DAY', label: 'Exact day' },
  { value: 'MONTH', label: 'Month' },
  { value: 'QUARTER', label: 'Quarter' },
  { value: 'YEAR', label: 'Year' },
  { value: 'APPROXIMATE', label: 'Approximate' },
];

const PRECISION_HINTS: Record<DatePrecision, string> = {
  DAY: 'Saved as this exact day.',
  MONTH: 'Pick any day in the month; only the month is saved.',
  QUARTER: 'Pick any day in the quarter; only the quarter is saved.',
  YEAR: 'Pick any day in the year; only the year is saved.',
  APPROXIMATE: 'Saved as an approximate date.',
};

export const precisionHint = (precision: PrecisionChoice): string =>
  precision ? PRECISION_HINTS[precision] : 'No date is saved.';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function fromPlannedDate(value: PlannedDate | null): PlannedDateModel {
  return value ? { precision: value.precision, date: value.date } : { precision: '', date: '' };
}

/**
 * The `PlannedDate` to send, normalised to the first day of its period (project-instruction §10.5) so a coarse date
 * never carries a day the user did not choose. `null` when Not set or the date is malformed.
 */
export function toPlannedDate(model: PlannedDateModel): PlannedDate | null {
  const match = ISO_DAY.exec(model.date);
  if (!model.precision || !match) {
    return null;
  }
  const [, year, month] = match;
  switch (model.precision) {
    case 'MONTH':
      return { date: `${year}-${month}-01`, precision: 'MONTH' };
    case 'QUARTER': {
      const first = Math.floor((Number(month) - 1) / 3) * 3 + 1;
      return { date: `${year}-${String(first).padStart(2, '0')}-01`, precision: 'QUARTER' };
    }
    case 'YEAR':
      return { date: `${year}-01-01`, precision: 'YEAR' };
    default:
      return { date: model.date, precision: model.precision };
  }
}

/** A date is required once a precision is chosen. */
export function plannedDateRules(path: SchemaPathTree<PlannedDateModel>): void {
  required(path.date, {
    when: ({ valueOf }) => valueOf(path.precision) !== '',
    message: 'Choose a date, or set the precision to Not set.',
  });
}
