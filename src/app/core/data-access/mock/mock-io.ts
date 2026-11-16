import { map, type Observable } from 'rxjs';
import type { MockPlanState } from './mock-plan-state';
import type { MockResponder } from './mock-responder';

/** A read with the `?mock=` mode; errors thrown by `read` reach the subscriber. */
export function mockRead<T>(
  responder: MockResponder,
  resource: string,
  read: () => T,
): Observable<T> {
  return responder
    .respond<() => T>(
      resource,
      () => read,
      () => read,
    )
    .pipe(map((value) => value()));
}

/** A write that runs after the simulated latency, so a failed mode never changes the session state. */
export function mockWrite<T>(
  responder: MockResponder,
  state: MockPlanState,
  apply: () => T,
): Observable<T> {
  return responder
    .respond<() => T>(
      state.nextWrite(),
      () => apply,
      () => apply,
    )
    .pipe(map((run) => run()));
}
