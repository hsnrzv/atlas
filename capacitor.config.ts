import type { CapacitorConfig } from '@capacitor/cli';

// Native iOS/Android shells are added in a later phase (`npx cap add ios|android`); this file
// already fixes the app identity so store listings and deep links are stable from day one.
const config: CapacitorConfig = {
  appId: 'dev.myatlas.app',
  appName: 'IKIGAI ATLAS',
  webDir: 'dist/atlas-frontend/browser',
};

export default config;
