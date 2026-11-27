import type { GoalId } from './goal';
import type { IkigaiAreaKey } from './life-dimension';
import type { Money } from './money';
import type { PlannedDate } from './planned-date';

/**
 * Proposed read model `GET /api/v1/connections` (FQ-15, Figma page 09). Deferred by the backend to Phase 6: it needs
 * finance impacts (§9.8), which require a confirmed amount; this model is the starting point of that contract. The
 * backend decides; the frontend only renders.
 *
 * - `ASSOCIATION`: the Destination is assigned to the dimension (`primary` for `primaryAreaKey`).
 * - `POSSIBLE_IMPACT`: the Destination could affect the dimension; `verified: false` until the owner confirms it.
 */
export type ConnectionKind = 'ASSOCIATION' | 'POSSIBLE_IMPACT';

export interface GoalConnection {
  readonly id: string;
  readonly goalId: GoalId;
  readonly goalTitle: string;
  readonly areaKey: IkigaiAreaKey;
  readonly kind: ConnectionKind;
  readonly primary: boolean;
  readonly verified: boolean;
  /** Details of a possible impact; `null` for associations. */
  readonly impact: ConnectionImpact | null;
}

export interface ConnectionImpact {
  /** e.g. "Potential financial effect". */
  readonly title: string;
  readonly description: string;
  /** What the impact depends on, e.g. "Programme / fees", and whether the owner has confirmed it. */
  readonly subject: string | null;
  readonly subjectConfirmed: boolean;
  /** Never invented: `null` until the owner enters an amount (frontend.md §6.4). */
  readonly money: Money | null;
  readonly effectiveFrom: PlannedDate | null;
  readonly assumptions: string | null;
}
