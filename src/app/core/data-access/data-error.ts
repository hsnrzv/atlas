/**
 * Why a repository call failed. Reads show the Error state with Retry; writes keep the user's input and show the
 * message. `conflict` covers `409` (e.g. `NODE_LOCKED`, `DEPENDENCY_CYCLE`) and `412 VERSION_CONFLICT`;
 * `validation` covers `400`/`422` Problem Details with field errors (API-CONTRACT §4).
 */
export type AtlasDataErrorReason =
  'unavailable' | 'not-found' | 'network' | 'conflict' | 'validation';

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

/** A user-facing sentence for a failed write; never shows raw server text for unexpected failures. */
export function writeErrorMessage(error: unknown): string {
  if (error instanceof AtlasDataError) {
    switch (error.reason) {
      case 'conflict':
      case 'validation':
      case 'not-found':
        return error.message;
      case 'unavailable':
        return 'The Atlas service is not connected yet. Nothing was saved.';
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
