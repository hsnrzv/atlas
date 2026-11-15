import { Component, effect, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatError, MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AtlasIcon } from '../../icons/atlas-icon';

/**
 * Search input (Figma Atlas/V3/SearchField 152:6047): outlined Material field with a leading search icon inside a
 * `search` landmark. `label` is the accessible name; the placeholder only hints at the query.
 */
@Component({
  selector: 'atlas-search-field',
  imports: [AtlasIcon, MatError, MatFormField, MatInput, MatPrefix, ReactiveFormsModule],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
  host: { role: 'search' },
})
export class AtlasSearchField {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly disabled = input(false);
  /** Message shown below the field; also marks the input invalid. */
  readonly error = input<string>();
  readonly value = model('');

  protected readonly control = new FormControl('', { nonNullable: true });
  protected readonly errorMatcher: ErrorStateMatcher = { isErrorState: () => !!this.error() };

  constructor() {
    this.control.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.value.set(value));
    effect(() => {
      const value = this.value();
      if (value !== this.control.value) {
        this.control.setValue(value, { emitEvent: false });
      }
    });
    effect(() => {
      if (this.disabled()) {
        this.control.disable({ emitEvent: false });
      } else {
        this.control.enable({ emitEvent: false });
      }
    });
  }
}
