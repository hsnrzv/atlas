import { EnvironmentProviders, Injector, inject, provideAppInitializer } from '@angular/core';
import { NATIVE_PLATFORM } from './native-platform';

/**
 * Connects the Capacitor shell (system bars, splash, keyboard, Android back button) on iOS and Android. The bridge
 * and the plugins load as a lazy chunk on native only; the browser build does nothing here. Startup is not blocked:
 * the splash stays up until the bridge hides it after the first render (or Capacitor's timeout).
 */
export function provideNativeShell(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (!inject(NATIVE_PLATFORM)) {
      return;
    }
    const injector = inject(Injector);
    void Promise.all([import('./native-bridge'), import('./capacitor-plugins')])
      .then(([{ AtlasNativeBridge }, { capacitorPlugins }]) =>
        injector.get(AtlasNativeBridge).connect(capacitorPlugins()),
      )
      .catch((error: unknown) => console.error('The native shell could not start.', error));
  });
}
