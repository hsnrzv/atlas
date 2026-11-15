import { TestBed } from '@angular/core/testing';
import { AtlasDateLabel, PlannedDate } from './date-label';

describe('AtlasDateLabel', () => {
  async function render(date: PlannedDate) {
    const fixture = TestBed.createComponent(AtlasDateLabel);
    fixture.componentRef.setInput('date', date);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('time');
  }

  it.each<[PlannedDate, string, string]>([
    [{ date: '2026-12-14', precision: 'DAY' }, '2026-12-14', 'Dec 14, 2026'],
    [{ date: '2026-12-01', precision: 'MONTH' }, '2026-12', 'Dec 2026'],
    [{ date: '2027-07-01', precision: 'QUARTER' }, '2027', 'Q3 2027'],
    [{ date: '2030-01-01', precision: 'YEAR' }, '2030', '2030'],
    [{ date: '2027-09-15', precision: 'APPROXIMATE' }, '2027-09-15', 'Around Sep 15, 2027'],
  ])('renders %o without extra precision', async (date, datetime, text) => {
    const time = await render(date);
    expect(time?.getAttribute('datetime')).toBe(datetime);
    expect(time?.textContent).toBe(text);
  });

  it('renders nothing for a malformed date', async () => {
    expect(await render({ date: 'soon', precision: 'DAY' })).toBeNull();
  });
});
