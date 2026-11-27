import type { SecondaryArea, SettableGoalStatus } from '../../models/goal';
import type { NodeType } from '../../models/goal-node';
import type { IkigaiAreaKey } from '../../models/life-dimension';
import type { OnboardingAreas, OnboardingStepStatus } from '../../models/onboarding';
import type { PlannedDate } from '../../models/planned-date';

/**
 * Request bodies of the Atlas API, written by hand from the draft API-CONTRACT until the backend publishes its
 * OpenAPI snapshot (F3-5, blocked by BE-3.82). Response bodies are the domain models in `core/models`, which follow
 * the contract's JSON one to one. When the generated types land, this file and the adapters' response types switch
 * to them; nothing outside `http/` changes.
 */

/**
 * `POST /goals`, `PATCH /goals/{goalId}` (API-CONTRACT §9.5). The reward is a separate resource. `status` is left out
 * when the goal is in a state `PATCH` cannot set (`COMPLETED`, `ARCHIVED`).
 */
export interface GoalWriteRequest {
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly primaryAreaKey: IkigaiAreaKey;
  readonly status?: SettableGoalStatus;
  readonly targetDate: PlannedDate | null;
}

/** `PATCH /goals/{goalId}` from the Connections "connect" flow. */
export interface GoalAreasRequest {
  readonly secondaryAreas: readonly SecondaryArea[];
}

/** `PUT /goals/{goalId}/reward`. */
export interface RewardRequest {
  readonly description: string;
}

/** `POST /goals/{goalId}/nodes`. */
export interface NodeCreateRequest {
  readonly parentId: string | null;
  readonly nodeType: NodeType;
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly dueDate: PlannedDate | null;
}

/** `POST /goals/{goalId}/dependencies`. */
export interface DependencyRequest {
  readonly prerequisiteNodeId: string;
  readonly dependentNodeId: string;
}

/** `POST /goals/{goalId}/notes`, `PATCH /goals/{goalId}/notes/{noteId}`. */
export interface NoteRequest {
  readonly nodeId?: string | null;
  readonly body: string;
}

/** `PUT /onboarding/steps/{stepKey}` (API-CONTRACT §9.3, FQ-17): the step outcome plus its payload. */
export interface OnboardingStepRequest {
  readonly status: Extract<OnboardingStepStatus, 'COMPLETED' | 'SKIPPED'>;
  readonly payload: OnboardingAreas | null;
}

/** The reward state `POST …/reward/redeem` answers with (API-CONTRACT §9.6). */
export interface RewardResponse {
  readonly description: string;
  readonly status: 'PLANNED' | 'EARNED' | 'REDEEMED';
  readonly earnedAt?: string | null;
  readonly redeemedAt?: string | null;
}
