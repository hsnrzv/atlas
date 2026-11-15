import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';

/** Backend date precision (API draft, backend PLAN-DATABASE §7.2 / D-3). */
export type DatePrecision = 'DAY' | 'MONTH' | 'QUARTER' | 'YEAR' | 'APPROXIMATE';

/**
 * A planned date as the backend sends it: an ISO `date` normalised to the start of its period plus the precision.
 * Presentation-only copy until the API models land with F2-2.
 */
export interface PlannedDate {
  readonly date: string;
  readonly precision: DatePrecision;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Renders a `PlannedDate` without adding precision it does not have (project-instruction §10.5): a MONTH date
 * reads "Dec 2026", never a day. The machine-readable value is in `<time datetime>`.
 */
@Component({
  selector: 'atlas-date-label',
  template: `
    @if (parts(); as value) {
      <time [attr.datetime]="value.datetime">{{ value.text }}</time>
    }
  `,
  styleUrl: './date-label.scss',
})
export class AtlasDateLabel {
  readonly date = input.required<PlannedDate>();

  private readonly locale = inject(LOCALE_ID);
  private readonly dayFormat = new Intl.DateTimeFormat(this.locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
  private readonly monthFormat = new Intl.DateTimeFormat(this.locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  protected readonly parts = computed(() => {
    const { date, precision } = this.date();
    const match = ISO_DATE.exec(date);
    if (!match) {
      return null;
    }
    const [, year, month, day] = match;
    // UTC keeps a date-only value on the same calendar day in every time zone.
    const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    switch (precision) {
      case 'YEAR':
        return { datetime: year, text: year };
      case 'QUARTER':
        return { datetime: year, text: `Q${Math.floor((Number(month) - 1) / 3) + 1} ${year}` };
      case 'MONTH':
        return { datetime: `${year}-${month}`, text: this.monthFormat.format(utc) };
      case 'APPROXIMATE':
        return { datetime: date, text: `Around ${this.dayFormat.format(utc)}` };
      default:
        return { datetime: date, text: this.dayFormat.format(utc) };
    }
  });
}
