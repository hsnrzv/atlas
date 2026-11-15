import { DOCUMENT, DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

export type AtlasThemeMode = 'light' | 'dark';
export type AtlasThemePreference = 'system' | AtlasThemeMode;

/** Only an explicit light/dark choice is stored (PLAN-FRONTEND D1); it is not sensitive. */
export const ATLAS_THEME_STORAGE_KEY = 'atlas.theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Colour theme (D1, R-5). Follows `prefers-color-scheme` until the user picks light or dark, then keeps
 * that choice in `localStorage`. Applies the theme as `data-theme` on `<html>` (see `_tokens.generated.scss`).
 */
@Injectable({ providedIn: 'root' })
export class AtlasTheme {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly media = this.window?.matchMedia?.(DARK_QUERY);
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly preference = signal<AtlasThemePreference>(this.readStoredPreference());
  readonly mode = computed<AtlasThemeMode>(() => {
    const preference = this.preference();
    if (preference !== 'system') {
      return preference;
    }
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    const media = this.media;
    if (media) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.dataset['theme'] = this.mode();
    });
  }

  setPreference(preference: AtlasThemePreference): void {
    this.preference.set(preference);
    this.writeStoredPreference(preference);
  }

  /** Switches to the opposite of the current mode as an explicit choice. */
  toggle(): void {
    this.setPreference(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private readStoredPreference(): AtlasThemePreference {
    try {
      const stored = this.window?.localStorage.getItem(ATLAS_THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  private writeStoredPreference(preference: AtlasThemePreference): void {
    try {
      const storage = this.window?.localStorage;
      if (preference === 'system') {
        storage?.removeItem(ATLAS_THEME_STORAGE_KEY);
      } else {
        storage?.setItem(ATLAS_THEME_STORAGE_KEY, preference);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); the choice then lasts for the session.
    }
  }
}
