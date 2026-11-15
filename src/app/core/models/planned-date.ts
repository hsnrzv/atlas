/** Backend date precision (API-CONTRACT §5, backend PLAN-DATABASE D-3). */
export type DatePrecision = 'DAY' | 'MONTH' | 'QUARTER' | 'YEAR' | 'APPROXIMATE';

/**
 * A planned date as the backend sends it: an ISO `date` (for MONTH, QUARTER and YEAR normalised to the first day of
 * the period) plus its precision. The UI never shows more precision than given.
 */
export interface PlannedDate {
  readonly date: string;
  readonly precision: DatePrecision;
}

/** Date-only business value (`LocalDate`, ISO `yyyy-mm-dd`). */
export type IsoDate = string;

/** Point in time (`Instant`, ISO 8601 with offset). */
export type IsoInstant = string;
