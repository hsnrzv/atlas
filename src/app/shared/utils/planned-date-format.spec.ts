import { formatPlannedDate, precisionLabel } from './planned-date-format';

describe('formatPlannedDate', () => {
  it('spells the month out in the long style without adding a day', () => {
    expect(formatPlannedDate({ date: '2026-12-01', precision: 'MONTH' }, 'en-US', 'long')).toEqual({
      datetime: '2026-12',
      text: 'December 2026',
    });
    expect(formatPlannedDate({ date: '2026-12-14', precision: 'DAY' }, 'en-US', 'long')?.text).toBe(
      'December 14, 2026',
    );
  });

  it('keeps year precision as a year', () => {
    expect(
      formatPlannedDate({ date: '2027-01-01', precision: 'YEAR' }, 'en-US', 'long')?.text,
    ).toBe('2027');
  });

  it('returns null for a malformed date', () => {
    expect(formatPlannedDate({ date: '2026-12', precision: 'MONTH' }, 'en-US')).toBeNull();
  });
});

describe('precisionLabel', () => {
  it('names coarse precisions and omits exact days', () => {
    expect(precisionLabel('MONTH')).toBe('month precision');
    expect(precisionLabel('APPROXIMATE')).toBe('approximate');
    expect(precisionLabel('DAY')).toBeNull();
  });
});
