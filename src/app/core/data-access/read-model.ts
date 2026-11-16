import { computed, linkedSignal, type Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';

export type ReadModelState = 'loading' | 'ready' | 'error';

/** A backend read for one page: the last value survives a failed or pending refresh. */
export interface ReadModel<T> {
  /** The newest value the backend returned; kept while a refresh runs or after it fails. */
  readonly value: Signal<T | undefined>;
  readonly state: Signal<ReadModelState>;
  /** A refresh is running while an older value is shown. */
  readonly refreshing: Signal<boolean>;
  /** Called when the page opens: the first visit loads, later visits refresh in the background. */
  enter(): void;
  retry(): void;
}

/**
 * Wraps `rxResource` with the My Atlas store behaviour (F2-3b) for the Phase 6 pages. Call in an injection context,
 * usually in a route-provided store. `params` re-runs the read when it changes (for example the Journey range).
 */
export function readModel<T, P = null>(
  stream: (params: P) => Observable<T>,
  params: () => P = () => null as P,
): ReadModel<T> {
  let visited = false;
  const resource = rxResource({
    params: () => ({ value: params() }),
    stream: ({ params: { value } }) => stream(value),
  });
  const value = linkedSignal<T | undefined, T | undefined>({
    source: () => (resource.hasValue() ? resource.value() : undefined),
    computation: (next, previous) => next ?? previous?.value,
  });
  return {
    value,
    state: computed(() => {
      if (resource.status() === 'error') {
        return 'error';
      }
      return value() === undefined ? 'loading' : 'ready';
    }),
    refreshing: computed(() => resource.isLoading() && value() !== undefined),
    enter: () => {
      if (visited) {
        resource.reload();
      }
      visited = true;
    },
    retry: () => resource.reload(),
  };
}
