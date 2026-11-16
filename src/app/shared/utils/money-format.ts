import type { Money } from '../../core/models/money';

/**
 * "€1,200.00" from the backend's decimal string; formatting only, never arithmetic (frontend.md §6.4). `null` money
 * means none was provided and is never shown as zero.
 */
export function formatMoney(money: Money, locale: string): string {
  try {
    // Intl accepts the decimal string directly (ES2023), so no float rounding happens on the way.
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency });
    return format.format(money.amount as unknown as number);
  } catch {
    return `${money.amount} ${money.currency}`;
  }
}
