import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { breakpoints } from '../../shared/design-system/tokens.generated';

/** Shell layout per viewport (frontend.md §12): bottom nav < 768, rail 768–1023, sidebar ≥ 1024. */
export type AtlasLayoutMode = 'mobile' | 'rail' | 'sidebar';

const RAIL_QUERY = `(min-width: ${breakpoints.md}px)`;
const SIDEBAR_QUERY = `(min-width: ${breakpoints.lg}px)`;

@Injectable({ providedIn: 'root' })
export class AtlasLayout {
  private readonly state = toSignal(
    inject(BreakpointObserver).observe([RAIL_QUERY, SIDEBAR_QUERY]),
  );

  readonly mode = computed<AtlasLayoutMode>(() => {
    const matches = this.state()?.breakpoints ?? {};
    if (matches[SIDEBAR_QUERY]) {
      return 'sidebar';
    }
    return matches[RAIL_QUERY] ? 'rail' : 'mobile';
  });
}
