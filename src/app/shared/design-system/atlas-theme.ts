import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type AtlasThemeMode = 'light' | 'dark';

/**
 * Applies the colour theme by toggling `data-theme` on `<html>` (see `_tokens.generated.scss`).
 * Light is the default. Persisting the preference is deferred until the Settings page exists.
 */
@Injectable({ providedIn: 'root' })
export class AtlasTheme {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<AtlasThemeMode>('light');

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      if (this.mode() === 'dark') {
        root.dataset['theme'] = 'dark';
      } else {
        delete root.dataset['theme'];
      }
    });
  }

  toggle(): void {
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }
}
