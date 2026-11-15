import type { GoalId } from './goal';
import type { NodeId } from './goal-node';
import type { IsoInstant } from './planned-date';

/**
 * A note on a Destination or one of its nodes (`/goals/{goalId}/notes`, API-CONTRACT §9.6). The contract stores
 * Markdown as text; the UI shows it as plain text (D13). The field name `body` is proposed (frontend.md §6.5, FQ-9).
 */
export interface GoalNote {
  readonly id: string;
  readonly goalId: GoalId;
  readonly nodeId: NodeId | null;
  readonly body: string;
  readonly createdAt: IsoInstant;
  readonly updatedAt: IsoInstant;
}
