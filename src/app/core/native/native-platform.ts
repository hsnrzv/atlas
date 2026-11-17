import { DOCUMENT, InjectionToken, inject } from '@angular/core';

export type NativePlatform = 'ios' | 'android';

interface CapacitorBridgeGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

/**
 * The platform when the app runs inside the Capacitor shell, `null` in a browser. Reads the bridge global that
 * Capacitor injects before the app starts, so the web build never loads `@capacitor/*`.
 */
export const NATIVE_PLATFORM = new InjectionToken<NativePlatform | null>('NATIVE_PLATFORM', {
  providedIn: 'root',
  factory: () => {
    const view = inject(DOCUMENT).defaultView as { Capacitor?: CapacitorBridgeGlobal } | null;
    const capacitor = view?.Capacitor;
    if (!capacitor?.isNativePlatform?.()) {
      return null;
    }
    const platform = capacitor.getPlatform?.();
    return platform === 'ios' || platform === 'android' ? platform : null;
  },
});
