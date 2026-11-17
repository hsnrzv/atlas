import type { CapacitorConfig } from '@capacitor/cli';

// Tide space (`color.tide.space`): the splash, app icon and first-frame background on both platforms
// (also `theme-color` in index.html; `assets:validate` checks the exported images).
const TIDE_SPACE = '#0B1020';

const config: CapacitorConfig = {
  appId: 'dev.myatlas.app',
  appName: 'IKIGAI ATLAS',
  webDir: 'dist/atlas-frontend/browser',
  backgroundColor: TIDE_SPACE,
  // Dev-only live reload (`npm run start:ios`): the native shell loads the `ng serve` dev server instead of the bundle.
  ...(process.env['CAP_SERVER_URL']
    ? { server: { url: process.env['CAP_SERVER_URL'], cleartext: true } }
    : {}),
  ios: {
    // The web layout pads itself with env(safe-area-inset-*) (viewport-fit=cover).
    contentInset: 'never',
  },
  plugins: {
    SystemBars: {
      // Older Android WebViews (< 140) report no safe areas; Capacitor injects --safe-area-inset-*.
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
    SplashScreen: {
      // AtlasNativeBridge hides the splash after the first navigation has rendered; the timeout is a fallback.
      launchAutoHide: true,
      launchShowDuration: 3000,
      launchFadeOutDuration: 200,
      backgroundColor: TIDE_SPACE,
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      // Matches `interactive-widget=resizes-content`: the layout shrinks so the focused field stays visible.
      resize: 'native',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
