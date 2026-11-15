/** Raised by a repository when the data cannot be loaded. Pages show the Error state with Retry. */
export class AtlasDataError extends Error {
  constructor(
    message: string,
    readonly reason: 'unavailable' | 'not-found' | 'network',
  ) {
    super(message);
    this.name = 'AtlasDataError';
  }
}
