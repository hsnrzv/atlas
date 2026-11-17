import { App } from '@capacitor/app';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import type { NativePlugins } from './native-bridge';

/** Adapts the Capacitor plugins to `NativePlugins`. Loaded on native only (see `provideNativeShell`). */
export function capacitorPlugins(): NativePlugins {
  return {
    setSystemBarsStyle: (mode) =>
      SystemBars.setStyle({
        style: mode === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      }),
    hideSplash: () => SplashScreen.hide(),
    onKeyboardShown: (listener) => void Keyboard.addListener('keyboardDidShow', () => listener()),
    onBackButton: (listener) =>
      void App.addListener('backButton', ({ canGoBack }) => listener(canGoBack)),
    minimizeApp: () => App.minimizeApp(),
  };
}
