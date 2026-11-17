# Asset exports

This file is the export record that design-instructions §12.4 asks for. Vector masters in `design/svg/` are the only
hand-edited sources. Every raster and platform file is **derived** by a script and validated by its properties
([DD-17](DESIGN_DECISIONS.md#dd-17-raster-exports-are-derived-and-validated-by-properties)).

- **Status:** web, store, Capacitor source and native project PNGs are Implemented and pass validation.
- **Pending:** verification on real devices and across launcher masks. See [Pending](#pending).

## Toolchain

| Item           | Value                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rasteriser     | `sharp` 0.35.5, bundling libvips 8.18.7 and librsvg 2.63.2. It is a devDependency of the repo, so nothing extra needs installing.                                                                            |
| Export script  | `scripts/assets/export-assets.mjs`. Its manifest is `scripts/assets/asset-manifest.mjs`, the single list of outputs used by both the export and the validation.                                              |
| Rendering      | Each SVG is rendered at the target density (`density = 72 × size / viewBoxWidth`), so there is no upscaling blur, then resized to exactly `size × size`.                                                     |
| Colour         | Converted to sRGB (`toColourspace('srgb')`), PNG compression level 9 with adaptive filtering. No ICC profile is embedded (to verify whether any store requires one).                                         |
| Alpha policies | `none`: flatten onto `#0B1020`, then `removeAlpha()`, giving RGB with no alpha channel. `opaque`: flatten, then `ensureAlpha(1)`, giving 32-bit RGBA that is fully opaque. `required`: transparency is kept. |
| Validation     | `scripts/assets/validate-assets.mjs` (`npm run assets:validate`)                                                                                                                                             |

### Commands

```bash
npm run assets:export     # regenerate every output listed below (overwrites)
npm run assets:validate   # SVG safety and structure, plus raster size, colour space and alpha checks
npm run -s design:check   # tokens:check + contrast:check + assets:validate (CI gate)
```

Outputs are reproducible from the masters but **not byte-identical** across platforms or library versions, because
PNG encoding and font fallback can differ. Validation therefore checks dimensions, format, colour space and alpha, not
hashes. Re-export after any change to a master and commit the masters and the outputs together.

## Raster outputs

The source masters are in `design/svg/logo/`. Every row below is produced by `npm run assets:export` and checked by
`npm run assets:validate`, which looks at the PNG format, the exact size, the sRGB colour space and the alpha policy.
The last validation run passed for every row.

| Output                                           | Source master                          | Size (px)   | Alpha                  | Destination / consumer                                                                                   |
| ------------------------------------------------ | -------------------------------------- | ----------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `design/exports/app-icon/ios-app-store-1024.png` | `ikigai-atlas-app-icon-master.svg`     | 1024 × 1024 | none (RGB)             | iOS `AppIcon.appiconset` single-size source and the App Store Connect marketing icon                     |
| `design/exports/app-icon/google-play-512.png`    | `ikigai-atlas-app-icon-master.svg`     | 512 × 512   | opaque (32-bit RGBA)   | Google Play Console listing icon. This is separate from the launcher icons.                              |
| `design/exports/capacitor/icon-only.png`         | `ikigai-atlas-app-icon-master.svg`     | 1024 × 1024 | none                   | Icon source set in the Capacitor layout, for store tooling and manual checks                             |
| `design/exports/capacitor/icon-foreground.png`   | `ikigai-atlas-app-icon-foreground.svg` | 1024 × 1024 | required (transparent) | Adaptive-icon foreground source set                                                                      |
| `design/exports/capacitor/icon-background.png`   | solid `#0B1020` (generated)            | 1024 × 1024 | none                   | Adaptive-icon background source set                                                                      |
| `design/exports/capacitor/splash.png`            | `ikigai-atlas-splash.svg`              | 2732 × 2732 | none                   | Splash source set (light)                                                                                |
| `design/exports/capacitor/splash-dark.png`       | `ikigai-atlas-splash.svg`              | 2732 × 2732 | none                   | Splash source set (dark). It uses the same tide-space master, because the splash is dark in both themes. |
| `design/exports/social/avatar-400.png`           | `ikigai-atlas-app-icon-master.svg`     | 400 × 400   | none                   | Social profile avatar, symbol only (§13)                                                                 |
| `public/apple-touch-icon.png`                    | `ikigai-atlas-app-icon-master.svg`     | 180 × 180   | none                   | iOS Safari home screen (`<link rel="apple-touch-icon">`)                                                 |
| `public/icons/icon-192.png`                      | `ikigai-atlas-app-icon-master.svg`     | 192 × 192   | none                   | Web app manifest                                                                                         |
| `public/icons/icon-512.png`                      | `ikigai-atlas-app-icon-master.svg`     | 512 × 512   | none                   | Web app manifest                                                                                         |

### Native project outputs

`NATIVE_EXPORTS` in the manifest renders the same masters straight into the Capacitor projects, so no extra
generator is needed. `assets:validate` also checks that the Android colour resource `ic_launcher_background` (adaptive-icon
background) equals `#0B1020`, and that the top-left pixel of every opaque export is that colour.

| Output                                                                       | Source master                          | Size (px)                                 | Consumer                                        |
| ---------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`          | `ikigai-atlas-app-icon-master.svg`     | 1024 × 1024, RGB                          | iOS app icon (Xcode single size)                |
| `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732*.png` (3)      | `ikigai-atlas-splash.svg`              | 2732 × 2732, RGB                          | iOS launch screen                               |
| `android/app/src/main/res/mipmap-*/ic_launcher.png`, `ic_launcher_round.png` | `ikigai-atlas-app-icon-master.svg`     | 48 dp per density; round is circle-masked | Legacy launcher icons (API 24–25)               |
| `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`               | `ikigai-atlas-app-icon-foreground.svg` | 108 dp per density, transparent           | Adaptive icon foreground (API 26+)              |
| `android/app/src/main/res/drawable{,-port-*,-land-*}/splash.png`             | `ikigai-atlas-splash.svg`              | Capacitor template sizes, centre-cropped  | Splash (API 24–30; Android 12+ uses the colour) |

### Favicons

| Output               | Source                        | Method                                                                                                         | Validation                          |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `public/favicon.svg` | `design/svg/logo/favicon.svg` | Copied byte for byte. It contains a `prefers-color-scheme: dark` style, so it adapts to the browser tab theme. | Must equal the source               |
| `public/favicon.ico` | `design/svg/logo/favicon.svg` | Rendered at 16, 32 and 48 px and packed as a PNG-in-ICO by the export script, with no extra dependency.        | Valid ICO header (type 1, 3 images) |

`src/index.html` references these files:

- `favicon.ico` (with `sizes="48x48"`);
- `favicon.svg` (`image/svg+xml`);
- `apple-touch-icon.png`;
- `manifest.webmanifest`;
- `<meta name="theme-color" content="#0B1020">` (tide space).

### Web app manifest

`public/manifest.webmanifest` is maintained by hand and is not generated.

| Field                              | Value                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `name` / `short_name`              | "IKIGAI ATLAS" / "Atlas"                                                           |
| `description`                      | "See the whole. Shape what matters."                                               |
| `display`, `start_url`, `scope`    | `standalone`, `/`, `/`                                                             |
| `background_color` / `theme_color` | `#F5F7FA` (light page) / `#0B1020` (tide space)                                    |
| `icons`                            | `icons/icon-192.png`, `icons/icon-512.png` and `favicon.svg`, all `purpose: "any"` |

There is **no maskable icon** and no service worker. PWA installability is to verify. A maskable variant would need the
foreground safe zone; it could be derived from `icon-foreground.png` on tide space. See [Pending](#pending).

### Brand SVGs served by the app

`angular.json` copies `design/svg/logo/ikigai-atlas-*.svg` to `/brand/*.svg`, excluding the app-icon and splash masters
([DD-23](DESIGN_DECISIONS.md#dd-23-brand-masters-are-served-at-brand)). These are the masters themselves; no conversion
is applied.

## Vector masters and their checks

`npm run assets:validate` applies these checks to every SVG in `design/svg/logo/`:

| Check        | Rule                                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safety       | No embedded `<image>`. No `href` except internal `#` fragments. No `<script>` and no `on*=` handlers. A `viewBox` is required. Each file must parse as XML.                                                                         |
| Required set | Symbol (+ on-dark, monochrome, dimensions), wordmark (+ on-dark), horizontal lockup (+ on-dark), stacked lockup (+ on-dark), monochrome (+ on-light, on-dark), app-icon master, app-icon foreground, splash and favicon must exist. |
| Editability  | Wordmark, lockup and monochrome files keep `<text>IKIGAI ATLAS</text>` as live, editable text.                                                                                                                                      |
| No text      | App icon and splash contain no `<text>` (§12.1).                                                                                                                                                                                    |
| App icon     | The viewBox is `0 0 1024 1024` with a full-bleed `#0B1020` background.                                                                                                                                                              |

The wireframes in `design/mockups/` are documentation, not assets. They are deliberately not part of the manifest, but
they follow the same safety rules.

### Icon geometry (verified against the masters)

| Master                                        | Composition                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ikigai-atlas-app-icon-master.svg` (1024)     | A full-bleed tide-space (`#0B1020`) rectangle with the Venn symbol scaled ×12.5: an 800 px symbol box with a 112 px inset (enlarged from the Figma 640/192 master for optical parity with system icons). Circles use `screen` at 82 %. No text. The store masks the corners itself, so it is not pre-rounded. |
| `ikigai-atlas-app-icon-foreground.svg` (1024) | A transparent background with the symbol scaled ×10. The mark radius is 304 px, inside the 313 px safe radius (66 dp of 108 dp), so it survives circle, squircle and rounded-square masks (§12.3).                                                                                                            |
| `ikigai-atlas-splash.svg` (2732)              | Solid `#0B1020` with the symbol centred and scaled ×13 (about 790 px, about 29 % of the width). No text.                                                                                                                                                                                                      |

The Figma file also shows a light app-icon variant on `#F5F7FA`. It is not exported: one dark master serves every
platform, and `splash.png` and `splash-dark.png` share the same dark source
([DD-34](DESIGN_DECISIONS.md#dd-34-figma-v3-tokens-typography-icons-and-brand-phase-2)).

## Mapping to the spec's deliverable structure

| design-instructions §0 | Actual location                                                            | Why                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exports/app-icon/`    | `design/exports/app-icon/`                                                 | As specified                                                                                                                                        |
| `exports/splash/`      | `design/exports/capacitor/splash.png`, `splash-dark.png`                   | The icon and splash sources sit together in the Capacitor input layout ([DD-18](DESIGN_DECISIONS.md#dd-18-splash-exports-live-in-exportscapacitor)) |
| `exports/social/`      | `design/exports/social/`                                                   | Only the avatar so far                                                                                                                              |
| Favicon set (§13)      | `public/favicon.{svg,ico}`, `public/apple-touch-icon.png`, `public/icons/` | Served directly by the Angular build                                                                                                                |

## Store requirements (§12)

| Requirement                                                                  | Status                                                                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| iOS App Store icon: 1024 × 1024 PNG, RGB, no transparency                    | `ios-app-store-1024.png` passes (no alpha channel). The Xcode asset catalog uses the same render. |
| Google Play listing icon: 512 × 512, 32-bit PNG                              | `google-play-512.png` is RGBA and fully opaque. Play's 1024 kB size limit is to verify at upload. |
| Android adaptive icon: foreground and background layers within the safe zone | Foreground mipmaps are exported per density; the background is the colour `#0B1020`.              |
| Android legacy density icons                                                 | `ic_launcher.png` and `ic_launcher_round.png` are exported per density.                           |
| Splash with a centred symbol on a solid brand background                     | iOS and Android splash images are exported; `capacitor.config.ts` configures the splash.          |
| App icon has no text and a generous safe area                                | Enforced by validation (no `<text>`) and by the geometry above.                                   |
| Verified on device or simulator, across launcher masks and densities         | iOS simulator checked; devices and Android launcher masks are **pending**                         |

## Marketing templates (§13)

Implemented: the social avatar (`avatar-400.png`, symbol only).

Not created yet (optional per §13):

- a social banner (wordmark, the line "See the whole. Shape what matters." and the route motif);
- an app-store feature graphic concept, which is 1024 × 500 for Play (to verify);
- a presentation cover.

Use the masters and tokens when creating them, and do not claim unbuilt features.

## Pending

Platform validation:

1. Verify the icon on an iOS device (home screen, Settings, Spotlight) and the splash in light and dark.
2. Verify the Android adaptive icon in the emulator and on a device with circle, squircle and rounded-square masks
   and several densities, plus the Android 12+ splash.
3. Add a monochrome layer for Android 13 themed icons (needs a monochrome master).
4. Add a maskable PWA icon, or document why there is none. Verify installability in Chrome DevTools.
5. Optional §13 marketing templates.
