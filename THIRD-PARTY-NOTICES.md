# Third-party notices (atlas frontend)

This file lists the third-party software and fonts used by the `atlas` frontend. Versions and licenses were read
from the installed `node_modules/*/package.json` and `LICENSE` files on 2026-11-12. The authoritative versions are
in `package-lock.json`. The consolidated list for all three repositories is in
[docs/architecture/DEPENDENCY-LICENSE-MATRIX.md](docs/architecture/DEPENDENCY-LICENSE-MATRIX.md).

Update this file in the same pull request that adds, removes or changes the license of a dependency.

## Shipped with the application (production dependencies)

These packages, or parts of them, end up in the browser bundle, the container image or the Capacitor apps. Each
license requires keeping its copyright notice, so the full license texts must be included in release artifacts
(see "Distribution obligations" below).

| Package                                                                      | Version | License    | Copyright / source                                                                      |
| ---------------------------------------------------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------------- |
| `@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router` | 22.2.6  | MIT        | © 2010-2026 Google LLC — <https://github.com/angular/angular>                           |
| `@angular/material`, `@angular/cdk`                                          | 22.2.7  | MIT        | © 2026 Google LLC — <https://github.com/angular/components>                             |
| `@capacitor/core`                                                            | 8.6.0   | MIT        | © 2017-present Drifty Co. — <https://github.com/ionic-team/capacitor>                   |
| `@tabler/icons-angular`, `@tabler/icons`                                     | 3.51.0  | MIT        | © 2020-2026 Paweł Kuna — <https://github.com/tabler/tabler-icons>                       |
| `rxjs`                                                                       | 7.8.2   | Apache-2.0 | <https://github.com/reactivex/rxjs>                                                     |
| `tslib`                                                                      | 2.9.1   | 0BSD       | © Microsoft Corporation — <https://github.com/Microsoft/tslib>                          |
| `@fontsource-variable/inter` (Inter variable font)                           | 5.3.0   | OFL-1.1    | © 2016 The Inter Project Authors — <https://github.com/rsms/inter>                      |
| `@fontsource/dm-serif-display` (DM Serif Display 400)                        | 5.3.0   | OFL-1.1    | © 2014-2017 Adobe Systems Incorporated (Reserved Font Name "Source"), © 2019 Google LLC |

Transitive production packages pulled in by Angular. Today they are not part of the browser bundle, but they are
listed for completeness:

| Package                 | Version | License      | Pulled in by                |
| ----------------------- | ------- | ------------ | --------------------------- |
| `parse5`                | 8.1.1   | MIT          | `@angular/cdk` (schematics) |
| `entities`              | 9.0.0   | BSD-2-Clause | `parse5`                    |
| `zod`                   | 4.6.6   | MIT          | `@angular/forms`            |
| `@standard-schema/spec` | 1.1.0   | MIT          | `@angular/forms`            |

**Brand assets.** The IKIGAI ATLAS logo, symbol and lockups in `design/svg/logo/` are project artwork. The seven Life
Dimension icons in `design/svg/dimensions/` are Tabler Icons 3.51.0 (MIT) path data. They are normalised only to the
Atlas convention (`currentColor`, stroke 1.75) by `scripts/assets/sync-dimension-icons.mjs`, and each file keeps the
Tabler attribution comment. The wordmark is live text set in Inter SemiBold (OFL-1.1). The editable masters
deliberately do not outline it, so viewing them needs Inter installed or a fallback font. The raster exports in
`design/exports/` are rendered from these masters.

## Container base image

| Image                                     | License                                                                         | Notes                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `nginxinc/nginx-unprivileged:1.30-alpine` | nginx: BSD-2-Clause; Alpine packages: various (mostly MIT/BSD/GPL for OS tools) | Runtime only; unmodified. Alpine OS package licenses apply to the image as distributed. |
| `node:26-alpine`                          | Node.js: MIT and bundled licenses                                               | Build stage only; not part of the final image.                                          |

## Development and build tooling (not shipped)

| Package                                                             | Version          | License           | Use                                                                                                               |
| ------------------------------------------------------------------- | ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@angular/cli`, `@angular/build`, `@angular/compiler-cli`           | 22.2.6           | MIT               | build, dev server, unit-test builder                                                                              |
| `@capacitor/cli`                                                    | 8.6.0            | MIT               | native project sync (Phase 10)                                                                                    |
| `typescript`                                                        | 6.0.3            | Apache-2.0        | compiler                                                                                                          |
| `vitest`                                                            | 5.1.0            | MIT               | unit/component tests                                                                                              |
| `jsdom`                                                             | 30.1.3           | MIT               | DOM for unit tests                                                                                                |
| `@playwright/test`                                                  | 1.65.0           | Apache-2.0        | end-to-end tests                                                                                                  |
| `@axe-core/playwright` (with `axe-core` 4.14.0)                     | 4.14.0           | MPL-2.0           | accessibility assertions in e2e tests; used unmodified                                                            |
| `eslint`, `@eslint/js`                                              | 10.14.0 / 10.0.1 | MIT               | linting                                                                                                           |
| `angular-eslint`                                                    | 22.6.0           | MIT               | Angular lint rules                                                                                                |
| `typescript-eslint`                                                 | 8.71.0           | MIT               | TypeScript lint rules                                                                                             |
| `stylelint`, `stylelint-config-standard-scss`                       | 17.16.0 / 17.0.0 | MIT               | SCSS linting                                                                                                      |
| `prettier`                                                          | 3.10.1           | MIT               | formatting                                                                                                        |
| `sharp`                                                             | 0.35.5           | Apache-2.0        | rasterising brand SVGs into PNG/ICO exports                                                                       |
| `@img/sharp-libvips-*` (installed by `sharp` for the host platform) | 1.3.4            | LGPL-3.0-or-later | prebuilt libvips, loaded dynamically by `sharp`; used only on developer/CI machines; never bundled or distributed |

License mix of the complete development tree (`package-lock.json`, 2026-11-12): MIT, Apache-2.0, ISC, BSD-2/3-Clause,
BlueOak-1.0.0, MPL-2.0, MIT-0, CC0-1.0, CC-BY-4.0 (data), Unlicense, Python-2.0, and LGPL-3.0-or-later (libvips only,
see above). No GPL/AGPL/SSPL or non-commercial licenses.

## Planned, not installed

Phase 5 candidates ([ADR-0004](docs/adr/0004-visualization-stack.md), proposed). Their licenses must be checked again
before installation:

| Package                                                                              | Release seen on npm (2026-11-12)   | License (to re-verify at install)                 |
| ------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------- |
| `echarts`                                                                            | 6.1.0                              | Apache-2.0                                        |
| `ngx-echarts`                                                                        | 22.0.0 (peer `@angular/core >=22`) | MIT                                               |
| `vis-timeline` (+ peers `vis-data` 8.0.6, `moment`, `@egjs/hammerjs`, …)             | 8.5.6                              | Apache-2.0 OR MIT                                 |
| `@fullcalendar/angular` + `fullcalendar` (v7 umbrella package) + `temporal-polyfill` | 7.1.4 / 7.1.4 / 1.0.8              | MIT (Premium plugins are commercial and excluded) |
| `d3` (only if a custom layout needs it)                                              | 7.9.2                              | ISC                                               |

## Distribution obligations

- **MIT / BSD / 0BSD / Apache-2.0:** keep copyright notices and license texts with distributed builds. The production
  build writes the license texts of all bundled JavaScript packages to `dist/atlas-frontend/3rdpartylicenses.txt`
  (Angular `extractLicenses`, on by default). That file does not yet cover the CSS-imported fonts, and it is not
  copied into the container image. Serving it, together with the OFL texts, from the app (for example an "About /
  licenses" route) is a backlog item before the first public or store release (PLAN-FRONTEND, F9-3).
- **OFL-1.1 fonts:** fonts may be bundled and embedded. They must not be sold on their own, and modified versions must
  not use the Reserved Font Names.
- **MPL-2.0 (`axe-core`):** used unmodified in tests only. Nothing is distributed.
- **LGPL-3.0 (`libvips`):** used only as a dynamically loaded build tool. Nothing is distributed.
