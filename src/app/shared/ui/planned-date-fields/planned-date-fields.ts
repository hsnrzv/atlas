import { Component, computed, input } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { PRECISION_OPTIONS, precisionHint, type PlannedDateModel } from '../../forms/planned-date';

/**
 * A date with its precision (F3-3, project-instruction §10.5): precision first, then any day inside the period.
 * Bind a `PlannedDateModel` field tree; validation comes from `plannedDateRules`.
 */
@Component({
  selector: 'atlas-planned-date-fields',
  imports: [FormField, MatError, MatFormField, MatHint, MatInput, MatLabel, MatOption, MatSelect],
  templateUrl: './planned-date-fields.html',
  styleUrl: './planned-date-fields.scss',
})
export class AtlasPlannedDateFields {
  readonly field = input.required<FieldTree<PlannedDateModel>>();
  readonly label = input.required<string>();

  protected readonly options = PRECISION_OPTIONS;
  protected readonly hasPrecision = computed(() => this.field().precision().value() !== '');
  protected readonly hint = computed(() => precisionHint(this.field().precision().value()));
  protected readonly dateError = computed(() => {
    const date = this.field().date();
    return date.touched() && date.invalid()
      ? (date.errors()[0]?.message ?? 'Check the date.')
      : null;
  });
}
