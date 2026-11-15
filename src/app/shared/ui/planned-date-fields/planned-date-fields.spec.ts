import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, submit } from '@angular/forms/signals';
import {
  fromPlannedDate,
  plannedDateRules,
  toPlannedDate,
  type PlannedDateModel,
} from '../../forms/planned-date';
import { AtlasPlannedDateFields } from './planned-date-fields';

@Component({
  imports: [AtlasPlannedDateFields],
  template: `<atlas-planned-date-fields label="Target" [field]="tree" />`,
})
class Host {
  readonly model = signal<PlannedDateModel>({ precision: '', date: '' });
  readonly tree = form(this.model, plannedDateRules);
}

describe('planned date helpers', () => {
  it('normalises a coarse date to the start of its period', () => {
    expect(toPlannedDate({ precision: 'MONTH', date: '2026-12-17' })).toEqual({
      date: '2026-12-01',
      precision: 'MONTH',
    });
    expect(toPlannedDate({ precision: 'QUARTER', date: '2027-08-20' })).toEqual({
      date: '2027-07-01',
      precision: 'QUARTER',
    });
    expect(toPlannedDate({ precision: 'YEAR', date: '2030-12-31' })).toEqual({
      date: '2030-01-01',
      precision: 'YEAR',
    });
    expect(toPlannedDate({ precision: 'APPROXIMATE', date: '2030-12-01' })).toEqual({
      date: '2030-12-01',
      precision: 'APPROXIMATE',
    });
  });

  it('returns null when Not set or malformed', () => {
    expect(toPlannedDate({ precision: '', date: '2030-01-01' })).toBeNull();
    expect(toPlannedDate({ precision: 'DAY', date: '' })).toBeNull();
    expect(fromPlannedDate(null)).toEqual({ precision: '', date: '' });
  });
});

describe('AtlasPlannedDateFields', () => {
  it('shows the date only after a precision is chosen and requires it then', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('legend')?.textContent).toBe('Target');
    expect(root.querySelector('input[type="date"]')).toBeNull();
    expect(root.textContent).toContain('No date is saved.');

    fixture.componentInstance.model.set({ precision: 'MONTH', date: '' });
    fixture.detectChanges();
    expect(root.querySelector('input[type="date"]')).not.toBeNull();
    expect(root.textContent).toContain('only the month is saved');

    const ok = await submit(fixture.componentInstance.tree, { action: async () => undefined });
    fixture.detectChanges();
    expect(ok).toBe(false);
    expect(root.querySelector('mat-error')?.textContent).toContain('Choose a date');

    const input = root.querySelector<HTMLInputElement>('input[type="date"]')!;
    input.value = '2026-12-17';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.model().date).toBe('2026-12-17');
  });
});
