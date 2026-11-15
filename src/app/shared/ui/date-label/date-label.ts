import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import type { PlannedDate } from '../../../core/models/planned-date';
import { formatPlannedDate, PlannedDateStyle } from '../../utils/planned-date-format';

export type { DatePrecision, PlannedDate } from '../../../core/models/planned-date';

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
  /** `long` spells the month out ("December 2026"), as Figma page 05 does in running text. */
  readonly format = input<PlannedDateStyle>('short');

  private readonly locale = inject(LOCALE_ID);

  protected readonly parts = computed(() =>
    formatPlannedDate(this.date(), this.locale, this.format()),
  );
}
