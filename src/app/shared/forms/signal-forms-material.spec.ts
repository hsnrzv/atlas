import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

/**
 * F3-0 spike (frontend.md §8, ADR-0009): Signal Forms `[formField]` on Material `matInput` and `mat-select`. Checks
 * that Material's error state, `aria-invalid` and the `aria-describedby` link to `mat-error` work without a bridge.
 */
@Component({
  imports: [FormField, MatError, MatFormField, MatInput, MatLabel, MatOption, MatSelect],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Name</mat-label>
      <input matInput [formField]="draft.name" />
      @if (draft.name().touched() && draft.name().invalid()) {
        <mat-error>Enter a name.</mat-error>
      }
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Dimension</mat-label>
      <mat-select [formField]="draft.dimension">
        <mat-option value="CAREER">Career</mat-option>
        <mat-option value="HEALTH">Health</mat-option>
      </mat-select>
      @if (draft.dimension().touched() && draft.dimension().invalid()) {
        <mat-error>Choose a Dimension.</mat-error>
      }
    </mat-form-field>
  `,
})
class SpikeForm {
  readonly model = signal({ name: '', dimension: '' });
  readonly draft = form(this.model, (path) => {
    required(path.name);
    required(path.dimension);
  });
}

describe('Signal Forms with Angular Material (F3-0 spike)', () => {
  function render() {
    const fixture = TestBed.createComponent(SpikeForm);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      input: root.querySelector('input')!,
      select: root.querySelector<HTMLElement>('mat-select')!,
      fields: root.querySelectorAll('mat-form-field'),
    };
  }

  it('writes input values to the model and model values to the select', () => {
    const { fixture, input, select } = render();
    input.value = 'Run a marathon';
    input.dispatchEvent(new Event('input'));
    fixture.componentInstance.model.update((value) => ({ ...value, dimension: 'HEALTH' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.model().name).toBe('Run a marathon');
    expect(select.textContent).toContain('Health');
  });

  it('shows the Material error state with aria-invalid and aria-describedby after submit', async () => {
    const { fixture, input, select, fields } = render();

    const saved = await submit(fixture.componentInstance.draft, { action: async () => undefined });
    fixture.detectChanges();

    expect(saved).toBe(false);
    expect(fields[0].classList).toContain('mat-form-field-invalid');
    expect(fields[1].classList).toContain('mat-form-field-invalid');
    // Material leaves aria-invalid off empty required controls and exposes aria-required instead.
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(select.getAttribute('aria-required')).toBe('true');
    const errorId = fields[0].querySelector('mat-error')!.id;
    expect(input.getAttribute('aria-describedby')).toContain(errorId);
    const selectErrorId = fields[1].querySelector('mat-error')!.id;
    expect(select.getAttribute('aria-describedby')).toContain(selectErrorId);
  });

  it('maps server errors from the submit action to the field', async () => {
    const { fixture, input } = render();
    const draft = fixture.componentInstance.draft;
    fixture.componentInstance.model.set({ name: 'Taken', dimension: 'CAREER' });

    await submit(draft, {
      action: async () => [{ fieldTree: draft.name, kind: 'server', message: 'Already used.' }],
    });
    fixture.detectChanges();

    expect(draft.name().errors()).toEqual([
      expect.objectContaining({ kind: 'server', message: 'Already used.' }),
    ]);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
