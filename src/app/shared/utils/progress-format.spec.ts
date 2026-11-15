import { formatPercent, percentValue, progressDetail } from './progress-format';

describe('progress format', () => {
  it('reads the backend percent and weights without recalculating', () => {
    expect(percentValue({ percent: '42.5' })).toBe(42.5);
    expect(percentValue(null)).toBe(0);
    expect(progressDetail({ percent: '0', countedWeight: '0', totalWeight: '4' })).toBe('0 of 4');
    expect(progressDetail({ percent: '0' })).toBeUndefined();
  });

  it('formats the percent for the locale', () => {
    expect(formatPercent({ percent: '60.0' }, 'en')).toBe('60%');
    expect(formatPercent({ percent: '12.5' }, 'en')).toBe('12.5%');
    expect(formatPercent(null, 'en')).toBe('0%');
  });
});
