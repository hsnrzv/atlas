import { DOCUMENT, inject, Injectable } from '@angular/core';
import { NEVER, Observable, defer, delay, of, switchMap, throwError, timer } from 'rxjs';
import { AtlasDataError } from '../data-error';

/**
 * How the mock answers, from the `?mock=` query flag (frontend.md §6.2), so every Figma state can be reviewed:
 * - `sample` (default): the §10.5 sample.
 * - `empty`: no Destinations yet.
 * - `loading`: never answers.
 * - `error`: every request fails.
 * - `refresh-error`: the first request per resource succeeds, later ones fail (Error state with the last saved plan).
 */
export type MockMode = 'sample' | 'empty' | 'loading' | 'error' | 'refresh-error';

const MODES: readonly MockMode[] = ['sample', 'empty', 'loading', 'error', 'refresh-error'];

/** Simulated network latency, so loading states are visible. */
export const MOCK_LATENCY_MS = 400;

export function readMockMode(search: string): MockMode {
  const value = new URLSearchParams(search).get('mock');
  return MODES.find((mode) => mode === value) ?? 'sample';
}

@Injectable({ providedIn: 'root' })
export class MockResponder {
  /** Read once at start-up, so the mode survives in-app navigation. */
  readonly mode: MockMode = readMockMode(inject(DOCUMENT).location?.search ?? '');
  private readonly requests = new Map<string, number>();

  /** Answers `resource` with latency and the selected mode. Factories run per request (fresh objects). */
  respond<T>(resource: string, sample: () => T, empty: () => T): Observable<T> {
    return defer(() => {
      const request = (this.requests.get(resource) ?? 0) + 1;
      this.requests.set(resource, request);
      switch (this.mode) {
        case 'loading':
          return NEVER;
        case 'error':
          return this.fail<T>();
        case 'refresh-error':
          return request === 1 ? this.succeed(sample) : this.fail<T>();
        case 'empty':
          return this.succeed(empty);
        default:
          return this.succeed(sample);
      }
    });
  }

  private succeed<T>(value: () => T): Observable<T> {
    return of(null).pipe(
      delay(MOCK_LATENCY_MS),
      switchMap(() => of(value())),
    );
  }

  private fail<T>(): Observable<T> {
    return timer(MOCK_LATENCY_MS).pipe(
      switchMap(() =>
        throwError(() => new AtlasDataError(`Simulated failure (?mock=${this.mode}).`, 'network')),
      ),
    );
  }
}
