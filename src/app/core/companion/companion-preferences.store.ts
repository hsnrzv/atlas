import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { ATLAS_ENVIRONMENT } from '../config/atlas-environment';
import type { CompanionTrigger } from './companion-copy';

/** `on`: card with art slot. `muted`: compact card without art or motion. `off`: no companion at all. */
export type CompanionMode = 'on' | 'muted' | 'off';

/** Non-sensitive UI preference, same rule as the theme (PLAN-FRONTEND D1). */
export const ATLAS_COMPANION_STORAGE_KEY = 'atlas.companion';

const MODES: readonly CompanionMode[] = ['on', 'muted', 'off'];

/**
 * Companion preferences (P-C1, frontend.md §9). Kept in `localStorage` until the profile API stores them. Dismissing
 * hides one appearance for the rest of the session; Mute and Disable change the preference.
 */
@Injectable({ providedIn: 'root' })
export class CompanionPreferencesStore {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly dismissedTriggers = signal<ReadonlySet<CompanionTrigger>>(new Set());

  readonly mode = signal<CompanionMode>(this.read());
  readonly dismissed = this.dismissedTriggers.asReadonly();
  /** Real companion art instead of the Atlas symbol (`companionArt` build flag, roadmap R-9). */
  readonly art = inject(ATLAS_ENVIRONMENT, { optional: true })?.companionArt ?? false;

  setMode(mode: CompanionMode): void {
    this.mode.set(mode);
    try {
      if (mode === 'on') {
        this.window?.localStorage.removeItem(ATLAS_COMPANION_STORAGE_KEY);
      } else {
        this.window?.localStorage.setItem(ATLAS_COMPANION_STORAGE_KEY, mode);
      }
    } catch {
      // Storage can be unavailable; the choice then lasts for the session.
    }
  }

  dismiss(trigger: CompanionTrigger): void {
    this.dismissedTriggers.update((current) => new Set([...current, trigger]));
  }

  /** Whether `trigger` may appear: the companion is not off and this appearance was not dismissed. */
  shows(trigger: CompanionTrigger): boolean {
    return this.mode() !== 'off' && !this.dismissedTriggers().has(trigger);
  }

  private read(): CompanionMode {
    try {
      const stored = this.window?.localStorage.getItem(ATLAS_COMPANION_STORAGE_KEY);
      return MODES.find((mode) => mode === stored) ?? 'on';
    } catch {
      return 'on';
    }
  }
}
