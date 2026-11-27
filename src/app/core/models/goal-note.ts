import type { GoalId } from './goal';
import type { NodeId } from './goal-node';
import type { IsoInstant } from './planned-date';

/** Stored note format (API-CONTRACT §9.6). The UI shows both as plain text (D13). */
export type NoteFormat = 'PLAIN' | 'MARKDOWN';

/**
 * A note on a Destination or one of its nodes (`/goals/{goalId}/notes`, API-CONTRACT §9.6, FQ-9). Updates and
 * deletes send the note's own `version` as `If-Match` (API-CONTRACT §7).
 */
export interface GoalNote {
  readonly id: string;
  readonly goalId: GoalId;
  readonly nodeId: NodeId | null;
  readonly body: string;
  readonly format: NoteFormat;
  readonly createdAt: IsoInstant;
  readonly updatedAt: IsoInstant;
  readonly version: number;
}
