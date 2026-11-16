import { formatMoney } from './money-format';

describe('formatMoney', () => {
  it('formats the decimal string in the locale without rounding it through a number first', () => {
    expect(formatMoney({ amount: '1200.50', currency: 'EUR' }, 'en-US')).toBe('€1,200.50');
    expect(formatMoney({ amount: '12345678901234567.89', currency: 'USD' }, 'en-US')).toBe(
      '$12,345,678,901,234,567.89',
    );
  });

  it('falls back to the raw value for an unknown currency', () => {
    expect(formatMoney({ amount: '10', currency: 'not-a-code' }, 'en-US')).toBe('10 not-a-code');
  });
});
