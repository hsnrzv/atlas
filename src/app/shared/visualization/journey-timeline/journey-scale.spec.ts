import { journeyScale, rangeQuery } from './journey-scale';

describe('journey scale', () => {
  it('asks the backend for the range from the start of this month', () => {
    expect(rangeQuery('3m', '2026-11-12')).toEqual({ from: '2026-11-01', to: '2027-02-12' });
    expect(rangeQuery('1y', '2026-11-12')).toEqual({ from: '2026-11-01', to: '2027-11-12' });
    expect(rangeQuery('all', '2026-11-12')).toEqual({});
  });

  it('spans whole years for the whole plan', () => {
    const scale = journeyScale('all', '2026-11-12', ['2026-12-01', '2030-01-01'], 'en-US');

    expect(scale.start).toBe('2026-01-01');
    expect(scale.end).toBe('2031-01-01');
    expect(scale.ticks.map((tick) => tick.label)).toEqual([
      '2026',
      '2027',
      '2028',
      '2029',
      '2030',
      '2031',
    ]);
    expect(scale.offset('2026-01-01')).toBe(0);
    expect(scale.offset('2031-01-01')).toBe(100);
    expect(scale.offset('2028-07-02')).toBeCloseTo(50, 0);
  });

  it('shows months for a short range and clamps dates outside it', () => {
    const scale = journeyScale('3m', '2026-11-12', [], 'en-US');

    expect(scale.ticks.map((tick) => tick.label)).toEqual(['Nov', 'Dec', '2027', 'Feb']);
    expect(scale.offset('2020-01-01')).toBe(0);
    expect(scale.offset('2040-01-01')).toBe(100);
  });
});
