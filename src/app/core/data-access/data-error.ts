/**
 * Why a repository call failed. Reads show the Error state with Retry; writes keep the user's input and show the
 * message. `conflict` covers `409` (e.g. `NODE_LOCKED`, `DEPENDENCY_CYCLE`) and `412 VERSION_CONFLICT`;
 * `validation` covers `400`/`422` Problem Details with field errors; `unauthorized` covers `401`/`403`;
 * `unavailable` covers `5xx` and a missing backend; `network` covers no response at all (API-CONTRACT §4,
 * `http/problem-details.ts`).
 */
export type AtlasDataErrorReason =
  'unavailable' | 'not-found' | 'network' | 'conflict' | 'validation' | 'unauthorized';

export interface AtlasDataErrorDetails {
  /** Problem Details `code`, e.g. `NODE_LOCKED`. */
  readonly code?: string;
  /** Field name → message, from Problem Details `errors[]`. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

export class AtlasDataError extends Error {
  readonly code: string | undefined;
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(
    message: string,
    readonly reason: AtlasDataErrorReason,
    details: AtlasDataErrorDetails = {},
  ) {
    super(message);
    this.name = 'AtlasDataError';
    this.code = details.code;
    this.fieldErrors = details.fieldErrors ?? {};
  }
}

/** Copy for `412 VERSION_CONFLICT` / `428`: the store has already reloaded the latest version when this shows. */
export const VERSION_CONFLICT_MESSAGE =
  'This was changed elsewhere, and the latest version is now shown. Check it, then try again.';

/**
 * The write used an outdated `version` (`412 VERSION_CONFLICT`) or sent none (`428 PRECONDITION_REQUIRED`). Stores
 * reload the resource and keep the user's input (API-CONTRACT §7, F4-3).
 */
export function isVersionConflict(error: unknown): error is AtlasDataError {
  return (
    error instanceof AtlasDataError &&
    error.reason === 'conflict' &&
    (error.code === 'VERSION_CONFLICT' || error.code === 'PRECONDITION_REQUIRED')
  );
}

/** A user-facing sentence for a failed write; never shows raw server text for unexpected failures. */
export function writeErrorMessage(error: unknown): string {
  if (error instanceof AtlasDataError) {
    switch (error.reason) {
      case 'conflict':
      case 'validation':
      case 'not-found':
        return error.message;
      case 'unauthorized':
        return 'You are not signed in, or you may not do this. Nothing was saved.';
      case 'unavailable':
        return 'The Atlas service is not available right now. Nothing was saved.';
    }
  }
  return 'Could not save. Check your connection and try again.';
}

/** A failed write as a form shows it: one message plus per-field messages from Problem Details `errors[]`. */
export interface WriteFailure {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

export function writeFailure(error: unknown): WriteFailure {
  return {
    message: writeErrorMessage(error),
    fieldErrors: error instanceof AtlasDataError ? error.fieldErrors : {},
  };
}
