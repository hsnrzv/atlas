// Single source of truth for derived raster/platform assets.
// Used by export-assets.mjs (generation) and validate-assets.mjs (verification).
export const LOGO = 'design/svg/logo';
export const EXPORTS = 'design/exports';
/** App icon, splash and adaptive-icon background: Figma V3 tide space (pages 01/15). */
export const APP_BACKGROUND = '#0B1020';

/**
 * alpha: 'none' = must be opaque RGB without alpha channel (App Store),
 *        'required' = must keep transparency, 'opaque' = alpha channel allowed but fully opaque.
 */
export const RASTER_EXPORTS = [
  // iOS App Store marketing icon / Xcode single-size AppIcon source.
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: `${EXPORTS}/app-icon/ios-app-store-1024.png`,
    size: 1024,
    alpha: 'none',
    platform: 'iOS AppIcon.appiconset / App Store Connect',
  },
  // Google Play listing icon (separate from launcher icons).
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: `${EXPORTS}/app-icon/google-play-512.png`,
    size: 512,
    alpha: 'opaque',
    platform: 'Google Play Console listing',
  },
  // @capacitor/assets sources (`npx @capacitor/assets generate --assetPath design/exports/capacitor`).
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: `${EXPORTS}/capacitor/icon-only.png`,
    size: 1024,
    alpha: 'none',
    platform: '@capacitor/assets icon (iOS + Android legacy + PWA)',
  },
  {
    source: `${LOGO}/ikigai-atlas-app-icon-foreground.svg`,
    out: `${EXPORTS}/capacitor/icon-foreground.png`,
    size: 1024,
    alpha: 'required',
    platform: '@capacitor/assets Android adaptive foreground',
  },
  {
    solid: APP_BACKGROUND,
    out: `${EXPORTS}/capacitor/icon-background.png`,
    size: 1024,
    alpha: 'none',
    platform: '@capacitor/assets Android adaptive background',
  },
  {
    source: `${LOGO}/ikigai-atlas-splash.svg`,
    out: `${EXPORTS}/capacitor/splash.png`,
    size: 2732,
    alpha: 'none',
    platform: '@capacitor/assets splash (light)',
  },
  {
    source: `${LOGO}/ikigai-atlas-splash.svg`,
    out: `${EXPORTS}/capacitor/splash-dark.png`,
    size: 2732,
    alpha: 'none',
    platform: '@capacitor/assets splash (dark)',
  },
  // Social avatar (symbol only).
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: `${EXPORTS}/social/avatar-400.png`,
    size: 400,
    alpha: 'none',
    platform: 'Social profile avatar',
  },
  // Web (served from public/).
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: 'public/apple-touch-icon.png',
    size: 180,
    alpha: 'none',
    platform: 'iOS Safari home screen',
  },
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: 'public/icons/icon-192.png',
    size: 192,
    alpha: 'none',
    platform: 'Web app manifest',
  },
  {
    source: `${LOGO}/ikigai-atlas-app-icon-master.svg`,
    out: 'public/icons/icon-512.png',
    size: 512,
    alpha: 'none',
    platform: 'Web app manifest',
  },
];

const ICON_MASTER = `${LOGO}/ikigai-atlas-app-icon-master.svg`;
const ICON_FOREGROUND = `${LOGO}/ikigai-atlas-app-icon-foreground.svg`;
const SPLASH = `${LOGO}/ikigai-atlas-splash.svg`;
const IOS_ASSETS = 'ios/App/App/Assets.xcassets';
const ANDROID_RES = 'android/app/src/main/res';

/** Android density buckets: launcher icon 48 dp, adaptive layer 108 dp, splash sizes from the Capacitor template. */
const ANDROID_DENSITIES = [
  { bucket: 'mdpi', scale: 1, splash: [320, 480] },
  { bucket: 'hdpi', scale: 1.5, splash: [480, 800] },
  { bucket: 'xhdpi', scale: 2, splash: [720, 1280] },
  { bucket: 'xxhdpi', scale: 3, splash: [960, 1600] },
  { bucket: 'xxxhdpi', scale: 4, splash: [1280, 1920] },
];

/**
 * Native project assets, rendered from the same masters straight into the Capacitor projects (replaces
 * `@capacitor/assets`). `width`/`height` default to `size`; `fit: 'cover'` centre-crops the square splash;
 * `mask: 'circle'` cuts the legacy round launcher icon.
 */
export const NATIVE_EXPORTS = [
  {
    source: ICON_MASTER,
    out: `${IOS_ASSETS}/AppIcon.appiconset/AppIcon-512@2x.png`,
    size: 1024,
    alpha: 'none',
    platform: 'iOS app icon (Xcode single size)',
  },
  ...['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'].map((name) => ({
    source: SPLASH,
    out: `${IOS_ASSETS}/Splash.imageset/${name}`,
    size: 2732,
    alpha: 'none',
    platform: 'iOS launch screen',
  })),
  ...ANDROID_DENSITIES.flatMap(({ bucket, scale, splash: [w, h] }) => [
    {
      source: ICON_MASTER,
      out: `${ANDROID_RES}/mipmap-${bucket}/ic_launcher.png`,
      size: 48 * scale,
      alpha: 'none',
      platform: 'Android legacy launcher icon (API 24–25)',
    },
    {
      source: ICON_MASTER,
      out: `${ANDROID_RES}/mipmap-${bucket}/ic_launcher_round.png`,
      size: 48 * scale,
      alpha: 'required',
      mask: 'circle',
      platform: 'Android legacy round launcher icon (API 24–25)',
    },
    {
      source: ICON_FOREGROUND,
      out: `${ANDROID_RES}/mipmap-${bucket}/ic_launcher_foreground.png`,
      size: 108 * scale,
      alpha: 'required',
      platform: 'Android adaptive icon foreground (background: @color/ic_launcher_background)',
    },
    {
      source: SPLASH,
      out: `${ANDROID_RES}/drawable-port-${bucket}/splash.png`,
      width: w,
      height: h,
      fit: 'cover',
      alpha: 'none',
      platform: 'Android splash, portrait (API 24–30)',
    },
    {
      source: SPLASH,
      out: `${ANDROID_RES}/drawable-land-${bucket}/splash.png`,
      width: h,
      height: w,
      fit: 'cover',
      alpha: 'none',
      platform: 'Android splash, landscape (API 24–30)',
    },
  ]),
  {
    source: SPLASH,
    out: `${ANDROID_RES}/drawable/splash.png`,
    width: 480,
    height: 320,
    fit: 'cover',
    alpha: 'none',
    platform: 'Android splash fallback',
  },
];

/** Android colour resources that must equal APP_BACKGROUND (adaptive icon layer, Android 12+ splash). */
export const ANDROID_BACKGROUND_COLOR = `${ANDROID_RES}/values/ic_launcher_background.xml`;

export const FAVICON = {
  svgSource: `${LOGO}/favicon.svg`,
  svgOut: 'public/favicon.svg',
  icoOut: 'public/favicon.ico',
  icoSizes: [16, 32, 48],
};
