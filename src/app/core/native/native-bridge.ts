import { Location } from '@angular/common';
import { DOCUMENT, Injectable, Injector, afterNextRender, effect, inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AtlasTheme, AtlasThemeMode } from '../theme/atlas-theme';

/** The native capabilities the shell uses; `capacitor-plugins.ts` implements them with Capacitor. */
export interface NativePlugins {
  /** `dark` = light status bar content for the dark theme. */
  setSystemBarsStyle(mode: AtlasThemeMode): Promise<void>;
  hideSplash(): Promise<void>;
  onKeyboardShown(listener: () => void): void;
  /** Android hardware or gesture back; `canGoBack` reports the WebView history. */
  onBackButton(listener: (canGoBack: boolean) => void): void;
  minimizeApp(): Promise<void>;
}

/** Native calls must not break the app; a failure is logged and the web behaviour stays. */
function settle(call: Promise<void>): void {
  call.catch((error: unknown) => console.warn('A native shell call failed.', error));
}

/** Overlays that Escape dismisses: dialogs, popovers, menus and select panels (not toasts or tooltips). */
const DISMISSIBLE_OVERLAY =
  '.cdk-overlay-pane :is([role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"])';

/**
 * Native shell behaviour from the Figma page 13 mobile contract (frontend.md §12): the system bars follow the
 * theme, the splash hides after the first render, the focused field stays visible above the keyboard, and the
 * Android back button closes the top overlay, then goes back, then leaves the app.
 */
@Injectable({ providedIn: 'root' })
export class AtlasNativeBridge {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly theme = inject(AtlasTheme);
  private connected = false;

  connect(plugins: NativePlugins): void {
    if (this.connected) {
      return;
    }
    this.connected = true;

    effect(() => settle(plugins.setSystemBarsStyle(this.theme.mode())), {
      injector: this.injector,
    });
    this.hideSplashAfterFirstRender(plugins);
    plugins.onKeyboardShown(() => this.revealFocusedField());
    plugins.onBackButton((canGoBack) => this.back(plugins, canGoBack));
  }

  private hideSplashAfterFirstRender(plugins: NativePlugins): void {
    const hide = () =>
      afterNextRender(() => settle(plugins.hideSplash()), { injector: this.injector });
    if (this.router.navigated) {
      hide();
      return;
    }
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        take(1),
      )
      .subscribe(hide);
  }

  /** The WebView already shrinks (`resize: native`); this scrolls the field into the remaining space. */
  private revealFocusedField(): void {
    const focused = this.document.activeElement;
    if (focused instanceof HTMLElement && focused !== this.document.body) {
      focused.scrollIntoView({ block: 'center' });
    }
  }

  private back(plugins: NativePlugins, canGoBack: boolean): void {
    if (this.document.querySelector(DISMISSIBLE_OVERLAY)) {
      // Escape is the one close path every overlay already handles (and respects disableClose).
      const target = this.document.activeElement ?? this.document.body;
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true,
          cancelable: true,
        }),
      );
      return;
    }
    if (canGoBack) {
      this.location.back();
      return;
    }
    settle(plugins.minimizeApp());
  }
}
