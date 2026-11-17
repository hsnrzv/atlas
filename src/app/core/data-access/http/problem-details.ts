import { HttpErrorResponse } from '@angular/common/http';
import { AtlasDataError, AtlasDataErrorReason, VERSION_CONFLICT_MESSAGE } from '../data-error';

/** RFC 9457 Problem Details as the Atlas API sends them (API-CONTRACT §4). Unknown members are ignored. */
export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly code?: string;
  readonly errors?: readonly ProblemFieldError[];
  readonly traceId?: string;
}

export interface ProblemFieldError {
  readonly field: string;
  readonly code?: string;
  readonly message?: string;
}

/**
 * User-facing copy per Problem Details `code`. The frontend localises from the code and never shows the server's
 * `detail` (frontend.md §15). Codes not listed fall back to the copy of their reason.
 */
const CODE_MESSAGES: Readonly<Record<string, string>> = {
  VERSION_CONFLICT: VERSION_CONFLICT_MESSAGE,
  PRECONDITION_REQUIRED: VERSION_CONFLICT_MESSAGE,
  NODE_LOCKED: 'This Step is blocked by an open prerequisite.',
  NODE_HAS_CHILDREN: 'This Waypoint has Steps or Waypoints below it.',
  DEPENDENCY_CYCLE: 'That prerequisite would create a loop. Choose a different one.',
  CROSS_GOAL_DEPENDENCY: 'A prerequisite must belong to the same Destination.',
  INVALID_STATUS_TRANSITION: 'This change is not possible in the current status.',
  REWARD_NOT_EARNED: 'Only an earned Milestone Award can be redeemed.',
  IDEMPOTENCY_KEY_REUSED: 'This request was already sent with different details. Try again.',
  CURRENCY_MISMATCH: 'Use the same currency as the rest of this plan.',
  RESOURCE_NOT_FOUND: 'This item no longer exists.',
};

const REASON_MESSAGES: Readonly<Record<AtlasDataErrorReason, string>> = {
  unavailable: 'The Atlas service is not available right now.',
  'not-found': 'This item no longer exists.',
  network: 'Could not reach the Atlas service. Check your connection and try again.',
  conflict: 'This change conflicts with the current plan. Check it, then try again.',
  validation: 'Some details need attention.',
  unauthorized: 'You are not signed in, or you may not do this.',
};

/** Copy per field-error `code` (Bean Validation names); others show {@link FIELD_MESSAGE}. */
const FIELD_CODE_MESSAGES: Readonly<Record<string, string>> = {
  NotBlank: 'Enter a value.',
  NotNull: 'Enter a value.',
  NotEmpty: 'Enter a value.',
  Size: 'This value is too long or too short.',
  InvalidEnum: 'Choose one of the options.',
  Unknown: 'This value is not supported.',
};

const FIELD_MESSAGE = 'Check this value.';

/** The reason a status maps to (API-CONTRACT §4). */
export function reasonForStatus(status: number): AtlasDataErrorReason {
  if (status === 0) {
    return 'network';
  }
  if (status === 400 || status === 422) {
    return 'validation';
  }
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  if (status === 404 || status === 410) {
    return 'not-found';
  }
  if (status === 409 || status === 412 || status === 428) {
    return 'conflict';
  }
  return status >= 500 ? 'unavailable' : 'network';
}

function asProblem(body: unknown): ProblemDetails | undefined {
  if (body === null || typeof body !== 'object') {
    return undefined;
  }
  return body as ProblemDetails;
}

/**
 * Field errors keyed by the contract's field path (`targetDate.precision`). Server `message`s are English defaults
 * meant for developers, so a field shows copy for its `code`, or generic copy.
 */
function fieldErrors(problem: ProblemDetails | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  const errors = Array.isArray(problem?.errors) ? problem.errors : [];
  for (const error of errors) {
    if (typeof error?.field === 'string' && !(error.field in result)) {
      result[error.field] = (error.code && FIELD_CODE_MESSAGES[error.code]) || FIELD_MESSAGE;
    }
  }
  return result;
}

/** Turns a failed API response into the typed error the stores and pages handle. */
export function toAtlasDataError(response: HttpErrorResponse): AtlasDataError {
  const problem = asProblem(response.error);
  const reason = reasonForStatus(response.status);
  const code =
    typeof problem?.code === 'string'
      ? problem.code
      : response.status === 412
        ? 'VERSION_CONFLICT'
        : response.status === 428
          ? 'PRECONDITION_REQUIRED'
          : undefined;
  const message = (code && CODE_MESSAGES[code]) || REASON_MESSAGES[reason];
  return new AtlasDataError(message, reason, { code, fieldErrors: fieldErrors(problem) });
}
