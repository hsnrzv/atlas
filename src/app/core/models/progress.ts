/** How the backend derives progress (API-CONTRACT §9.5). The frontend never re-derives it (frontend.md §6.3). */
export type ProgressPolicy = 'DERIVED' | 'MANUAL';

/** A node the backend left out of the progress calculation, e.g. an optional Step awaiting confirmation. */
export interface ExcludedNode {
  readonly nodeId: string;
  readonly title: string;
}

/**
 * Backend-derived progress. `percent` is a decimal string with one decimal place; `countedWeight` of `totalWeight`
 * gives the "2 of 10" detail. Display only.
 */
export interface Progress {
  readonly percent: string;
  readonly policy?: ProgressPolicy;
  readonly countedWeight?: string;
  readonly totalWeight?: string;
  /** Proposed contract addition (frontend.md §6.5, FQ-5). */
  readonly excludedNodes?: readonly ExcludedNode[];
}
