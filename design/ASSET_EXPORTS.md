# Asset exports

This file is the export record that design-instructions §12.4 asks for. Vector masters in `design/svg/` are the only
hand-edited sources. Every raster and platform file is **derived** by a script and validated by its properties
([DD-17](DESIGN_DECISIONS.md#dd-17-raster-exports-are-derived-and-validated-by-properties)).

- **Status:** web, store and Capacitor _source_ PNGs are Implemented and pass validation.
- **Pending (design step 7):** native platform projects and device verification. See [Pending](#pending).

## Toolchain

| Item           | Value                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rasteriser     | `sharp` 0.35.5, bundling libvips 8.18.7 and librsvg 2.63.2. It is a devDependency of the repo, so nothing extra needs installing.                                                                            |
| Export script  | `scripts/assets/export-assets.mjs`. Its manifest is `scripts/assets/asset-manifest.mjs`, the single list of outputs used by both the export and the validation.                                              |
| Rendering      | Each SVG is rendered at the target density (`density = 72 × size / viewBoxWidth`), so there is no upscaling blur, then resized to exactly `size × size`.                                                     |
| Colour         | Converted to sRGB (`toColourspace('srgb')`), PNG compression level 9 with adaptive filtering. No ICC profile is embedded (to verify whether any store requires one).                                         |
| Alpha policies | `none`: flatten onto `#14243A`, then `removeAlpha()`, giving RGB with no alpha channel. `opaque`: flatten, then `ensureAlpha(1)`, giving 32-bit RGBA that is fully opaque. `required`: transparency is kept. |
| Validation     | `scripts/assets/validate-assets.mjs` (`npm run assets:validate`)                                                                                                                                             |

### Commands

```bash
npm run assets:export     # regenerate every output listed below (overwrites)
npm run assets:validate   # SVG safety and structure, plus raster size, colour space and alpha checks
npm run icons:sync        # re-copy the 7 Life Dimension icons from @tabler/icons into design/svg/dimensions
npm run icons:check       # fail if design/svg/dimensions is out of sync
npm run -s design:check   # tokens:check + contrast:check + icons:check + assets:validate (CI gate)
```

Outputs are reproducible from the masters but **not byte-identical** across platforms or library versions, because
PNG encoding and font fallback can differ. Validation therefore checks dimensions, format, colour space and alpha, not
hashes. Re-export after any change to a master and commit the masters and the outputs together.

## Raster outputs

The source masters are in `design/svg/logo/`. Every row below is produced by `npm run assets:export` and checked by
`npm run assets:validate`, which looks at the PNG format, the exact size, the sRGB colour space and the alpha policy.
The last validation run passed for every row.

| Output                                           | Source master                          | Size (px)   | Alpha                  | Destination / consumer                                                                                      |
| ------------------------------------------------ | -------------------------------------- | ----------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `design/exports/app-icon/ios-app-store-1024.png` | `ikigai-atlas-app-icon-master.svg`     | 1024 × 1024 | none (RGB)             | iOS `AppIcon.appiconset` single-size source and the App Store Connect marketing icon                        |
| `design/exports/app-icon/google-play-512.png`    | `ikigai-atlas-app-icon-master.svg`     | 512 × 512   | opaque (32-bit RGBA)   | Google Play Console listing icon. This is separate from the launcher icons.                                 |
| `design/exports/capacitor/icon-only.png`         | `ikigai-atlas-app-icon-master.svg`     | 1024 × 1024 | none                   | `@capacitor/assets` icon source (iOS, Android legacy, PWA)                                                  |
| `design/exports/capacitor/icon-foreground.png`   | `ikigai-atlas-app-icon-foreground.svg` | 1024 × 1024 | required (transparent) | `@capacitor/assets` Android adaptive-icon foreground                                                        |
| `design/exports/capacitor/icon-background.png`   | solid `#14243A` (generated)            | 1024 × 1024 | none                   | `@capacitor/assets` Android adaptive-icon background                                                        |
| `design/exports/capacitor/splash.png`            | `ikigai-atlas-splash.svg`              | 2732 × 2732 | none                   | `@capacitor/assets` splash (light)                                                                          |
| `design/exports/capacitor/splash-dark.png`       | `ikigai-atlas-splash.svg`              | 2732 × 2732 | none                   | `@capacitor/assets` splash (dark). It uses the same navy master, because the splash is navy in both themes. |
| `design/exports/social/avatar-400.png`           | `ikigai-atlas-app-icon-master.svg`     | 400 × 400   | none                   | Social profile avatar, symbol only (§13)                                                                    |
| `public/apple-touch-icon.png`                    | `ikigai-atlas-app-icon-master.svg`     | 180 × 180   | none                   | iOS Safari home screen (`<link rel="apple-touch-icon">`)                                                    |
| `public/icons/icon-192.png`                      | `ikigai-atlas-app-icon-master.svg`     | 192 × 192   | none                   | Web app manifest                                                                                            |
| `public/icons/icon-512.png`                      | `ikigai-atlas-app-icon-master.svg`     | 512 × 512   | none                   | Web app manifest                                                                                            |

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
- `<meta name="theme-color" content="#14243A">`.

### Web app manifest

`public/manifest.webmanifest` is maintained by hand and is not generated.

| Field                              | Value                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `name` / `short_name`              | "IKIGAI ATLAS" / "Atlas"                                                           |
| `description`                      | "See the whole. Shape what matters."                                               |
| `display`, `start_url`, `scope`    | `standalone`, `/`, `/`                                                             |
| `background_color` / `theme_color` | `#FBF9F4` (ivory-50) / `#14243A` (midnight-900)                                    |
| `icons`                            | `icons/icon-192.png`, `icons/icon-512.png` and `favicon.svg`, all `purpose: "any"` |

There is **no maskable icon** and no service worker. PWA installability is to verify. A maskable variant would need the
foreground safe zone; it could be derived from `icon-foreground.png` on navy. See [Pending](#pending).

### Brand SVGs served by the app

`angular.json` copies `design/svg/logo/ikigai-atlas-*.svg` to `/brand/*.svg`, excluding the app-icon and splash masters
([DD-23](DESIGN_DECISIONS.md#dd-23-brand-masters-are-served-at-brand)). These are the masters themselves; no conversion
is applied.

## Vector masters and their checks

`npm run assets:validate` applies these checks to every SVG in `design/svg/logo/` and `design/svg/dimensions/`:

| Check        | Rule                                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safety       | No embedded `<image>`. No `href` except internal `#` fragments. No `<script>` and no `on*=` handlers. A `viewBox` is required. Each file must parse as XML.                                                                         |
| Required set | Symbol (+ on-dark, monochrome, dimensions), wordmark (+ on-dark), horizontal lockup (+ on-dark), stacked lockup (+ on-dark), monochrome (+ on-light, on-dark), app-icon master, app-icon foreground, splash and favicon must exist. |
| Editability  | Wordmark, lockup and monochrome files keep `<text>IKIGAI ATLAS</text>` as live, editable text.                                                                                                                                      |
| No text      | App icon and splash contain no `<text>` (§12.1).                                                                                                                                                                                    |
| App icon     | The viewBox is `0 0 1024 1024` with a full-bleed `#14243A` background.                                                                                                                                                              |
| Dimensions   | The 7 files in `design/svg/dimensions/` use a 24 × 24 viewBox, `stroke="currentColor"` and no hard-coded colours. They are generated by `npm run icons:sync` from Tabler 3.51 (MIT, attribution comment in each file).              |

The wireframes in `design/mockups/` are documentation, not assets. They are deliberately not part of the manifest, but
they follow the same safety rules.

### Icon geometry (verified against the masters)

| Master                                        | Composition                                                                                                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ikigai-atlas-app-icon-master.svg` (1024)     | A full-bleed navy rectangle with the symbol scaled ×11 (about 570 px; the comment in the file says about 600), ivory route and gold/ivory needle, no text. The store masks the corners itself, so it is not pre-rounded. |
| `ikigai-atlas-app-icon-foreground.svg` (1024) | A transparent background with the symbol scaled ×10. The mark radius is about 274 px, inside the 313 px safe radius (66 dp of 108 dp), so it survives circle, squircle and rounded-square masks (§12.3).                 |
| `ikigai-atlas-splash.svg` (2732)              | Solid `#14243A` with the symbol centred and scaled ×13 (about 675 px, about 25 % of the width). No text.                                                                                                                 |

## Mapping to the spec's deliverable structure

| design-instructions §0 | Actual location                                                            | Why                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exports/app-icon/`    | `design/exports/app-icon/`                                                 | As specified                                                                                                                                                              |
| `exports/splash/`      | `design/exports/capacitor/splash.png`, `splash-dark.png`                   | `@capacitor/assets` expects the icon and splash sources together in one `--assetPath` folder ([DD-18](DESIGN_DECISIONS.md#dd-18-splash-exports-live-in-exportscapacitor)) |
| `exports/social/`      | `design/exports/social/`                                                   | Only the avatar so far                                                                                                                                                    |
| Favicon set (§13)      | `public/favicon.{svg,ico}`, `public/apple-touch-icon.png`, `public/icons/` | Served directly by the Angular build                                                                                                                                      |

## Store requirements (§12)

| Requirement                                                                  | Status                                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| iOS App Store icon: 1024 × 1024 PNG, RGB, no transparency                    | `ios-app-store-1024.png` passes (no alpha channel). The Xcode asset catalog is not configured yet. |
| Google Play listing icon: 512 × 512, 32-bit PNG                              | `google-play-512.png` is RGBA and fully opaque. Play's 1024 kB size limit is to verify at upload.  |
| Android adaptive icon: foreground and background layers within the safe zone | Foreground and background PNGs are ready. Mipmaps are generated later by `@capacitor/assets`.      |
| Android legacy density icons                                                 | Generated later from `icon-only.png` by `@capacitor/assets`, if the native project needs them.     |
| Splash with a centred symbol on a solid brand background                     | `splash.png` and `splash-dark.png` are ready. Native splash configuration is pending.              |
| App icon has no text and a generous safe area                                | Enforced by validation (no `<text>`) and by the geometry above.                                    |
| Verified on device or simulator, across launcher masks and densities         | **Pending**                                                                                        |

## Marketing templates (§13)

Implemented: the social avatar (`avatar-400.png`, symbol only).

Not created yet (optional per §13):

- a social banner (wordmark, the line "See the whole. Shape what matters." and the route motif);
- an app-store feature graphic concept, which is 1024 × 500 for Play (to verify);
- a presentation cover.

Use the masters and tokens when creating them, and do not claim unbuilt features.

## Pending

Design step 7, platform validation:

1. `npx cap add ios` and `npx cap add android`. No native projects exist yet. `capacitor.config.ts` sets `appId`
   `dev.myatlas.app`, `appName` "IKIGAI ATLAS" and `webDir` `dist/atlas-frontend/browser`.
2. `npx @capacitor/assets generate --assetPath design/exports/capacitor`. This has not been run, and
   `@capacitor/assets` is not installed; it is fetched by `npx`. The output goes into the native projects; do not
   hand-edit the generated files (§12.2).
3. Verify the icon in the iOS Simulator and on a device (home screen, Settings, Spotlight) and the splash in light and
   dark.
4. Verify the Android adaptive icon in the emulator with circle, squircle and rounded-square masks and several
   densities, plus the Android 12+ splash behaviour (to verify how `@capacitor/assets` maps `splash.png`).
5. Add a maskable PWA icon, or document why there is none. Verify installability with Lighthouse.
6. Optional §13 marketing templates.
