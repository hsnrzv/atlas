/**
 * Money as the backend sends it (API-CONTRACT §5): `amount` is a decimal **string**, never a JSON number, and the
 * UI only formats it. Amounts in different currencies are never combined in the frontend.
 */
export interface Money {
  readonly amount: string;
  /** ISO 4217 alphabetic code, e.g. `EUR`. */
  readonly currency: string;
}
