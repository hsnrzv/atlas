# IKIGAI ATLAS design system

This folder is the design package for the IKIGAI ATLAS Angular/Capacitor frontend. It holds the brand masters, the
design tokens, the derived platform assets, the wireframes and the documentation that explains how they fit together.
The UI/UX specification is [`../design-instructions.md`](../design-instructions.md). The product and architecture
specification is [`../project-instruction.md`](../project-instruction.md).

> **Status legend used in every document.** **Implemented** means the item is in the repository and verified by a script
> or test. **Specified** or **Planned** means it is described in the specification or here but has not been built yet.
> Design steps 1–3 are implemented. Everything from the application shell onwards is planned.

Figma V3 is the visual source of truth ([ADR-0010](../docs/adr/0010-figma-visual-source-of-truth.md)). Phase 2 of the
migration has replaced the palette (tide, green, violet and gold, with light and dark themes), the fonts (Manrope
Variable for display and headings, Inter Variable for everything else), the icon stroke (Tabler outline, stroke 2) and
the logo (four-circle Venn symbol with a Manrope wordmark). See
[DD-34](DESIGN_DECISIONS.md#dd-34-figma-v3-tokens-typography-icons-and-brand-phase-2) and
[`docs/design/design-tokens.md`](../docs/design/design-tokens.md) for the shipped values.

## Design steps

| Step | Scope (design-instructions §0 phases)                                                   | Status      | Evidence                                                                                                |
| ---- | --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| 1    | Brand SVG masters: logo family, app icon, splash, favicon, Life Dimension icons (A + B) | Implemented | `design/svg/**`, `npm run assets:validate`                                                              |
| 2    | Design tokens and typography (B)                                                        | Implemented | `design/tokens/*.json`, `npm run tokens:check`, `npm run contrast:check`                                |
| 3    | Angular theme foundation: global styles, Material theme, icon and logo primitives (C)   | Implemented | `src/styles/**`, `src/app/shared/**`, temporary design-foundation page, `e2e/design-foundation.spec.ts` |
| 4    | Responsive application shell and navigation (D)                                         | Planned     | Wireframes only: [`mockups/`](mockups/)                                                                 |
| 5    | Reusable components and visualisation primitives (E)                                    | Planned     | [COMPONENT_CATALOG.md](COMPONENT_CATALOG.md)                                                            |
| 6    | Page templates for the eight areas (F)                                                  | Planned     | [PAGE_SPECIFICATIONS.md](PAGE_SPECIFICATIONS.md)                                                        |
| 7    | Platform validation: visual regression, native projects, Capacitor assets (G)           | Planned     | [ASSET_EXPORTS.md](ASSET_EXPORTS.md) § Pending                                                          |
| 8    | Documentation and handover (H)                                                          | Planned     | This package documents steps 1–3 and specifies 4–7                                                      |

## Documents

| Document                                         | Contents                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md)       | Numbered decision log (DD-01 onwards): context, decision, rationale, consequences and status |
| [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md)       | Logo meaning, variants, clear space, minimum sizes, colour, typography, do/don't, licensing  |
| [ACCESSIBILITY.md](ACCESSIBILITY.md)             | WCAG 2.2 AA rules, the generated contrast table, focus, motion, labelling, checks            |
| [RESPONSIVE_BEHAVIOR.md](RESPONSIVE_BEHAVIOR.md) | Breakpoints, layout tokens, shell behaviour per breakpoint, safe areas, Sass usage           |
| [COMPONENT_CATALOG.md](COMPONENT_CATALOG.md)     | Implemented primitives with their APIs, plus the planned `atlas-*` component catalogue       |
| [PAGE_SPECIFICATIONS.md](PAGE_SPECIFICATIONS.md) | The eight product areas: purpose, routes, data mapping, layouts and states                   |
| [ASSET_EXPORTS.md](ASSET_EXPORTS.md)             | Master → command → output table for every raster, store rules, pending platform steps        |

Related architecture decision records live in [`../docs/adr/`](../docs/adr/):

- [ADR-0005 Icon library (Tabler)](../docs/adr/0005-icon-library-tabler.md)
- [ADR-0006 UI vocabulary and domain mapping](../docs/adr/0006-ui-vocabulary-and-domain-mapping.md)
- [ADR-0007 Design tokens as the single source of truth](../docs/adr/0007-design-tokens-source-of-truth.md)
- [ADR-0010 Figma V3 is the visual source of truth](../docs/adr/0010-figma-visual-source-of-truth.md) (amends ADR-0005
  and ADR-0007)
- Also relevant: [ADR-0003 UI component stack](../docs/adr/0003-ui-component-stack.md),
  [ADR-0004 Visualization stack](../docs/adr/0004-visualization-stack.md) and
  [ADR-0008 Frontend test toolchain](../docs/adr/0008-frontend-test-toolchain.md)

## Folder map

The specification's deliverable structure (design-instructions §0) maps to the repository as follows.

| Spec path                        | Actual path                                                                                                                   | Notes                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design/*.md`                    | `design/*.md`                                                                                                                 | Same names                                                                                                                                                    |
| `design/tokens/*.json`           | `design/tokens/*.json`                                                                                                        | Adds **`layout.json`** (breakpoints, shell sizes, grid, z-index) and **`contrast-pairs.json`** (123 checked pairs). The second is not part of the token tree. |
| `design/svg/logo/` (6 files)     | `design/svg/logo/` (17 files)                                                                                                 | Adds on-dark, monochrome and dimension-coloured variants, the adaptive-icon foreground, splash and favicon                                                    |
| `design/exports/app-icon/`       | `design/exports/app-icon/`                                                                                                    | iOS App Store 1024 and Google Play 512                                                                                                                        |
| `design/exports/splash/`         | **`design/exports/capacitor/`** (`splash.png`, `splash-dark.png`)                                                             | Splash files sit next to the icon sources in the Capacitor input layout                                                                                       |
| `design/exports/social/`         | `design/exports/social/`                                                                                                      | `avatar-400.png`                                                                                                                                              |
| `design/mockups/*.svg`           | `design/mockups/*.svg`                                                                                                        | Static wireframes, not pixel specs                                                                                                                            |
| (web build outputs, not in spec) | `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icons/icon-{192,512}.png`                  | Generated by `npm run assets:export`. `public/manifest.webmanifest` is hand-written.                                                                          |
| (generated code, not in spec)    | `src/styles/tokens/_tokens.generated.scss`, `_breakpoints.generated.scss`, `src/app/shared/design-system/tokens.generated.ts` | Never edit these by hand. `npm run tokens:check` fails on drift.                                                                                              |

The production build also copies `design/svg/logo/ikigai-atlas-*.svg` to `/brand/` (`angular.json` assets). App-icon and
splash masters are excluded from that copy.

## Workflows

All commands run from the repository root.

### Change a token

1. Edit the JSON in `design/tokens/`. The format is W3C DTCG-style: `$value`, `$type`, `$description` and `{reference}`
   aliases. The CSS variable name is the token path joined with `-`, for example `color.text.muted` becomes
   `--color-text-muted`.
2. If you add or change a foreground/background combination, declare it in `design/tokens/contrast-pairs.json`.
3. Run `npm run tokens:build`. This regenerates the SCSS and TypeScript outputs and formats them with Prettier.
4. Run `npm run contrast:check`. It exits non-zero if any declared pair falls below its WCAG level.
5. Commit the JSON together with the regenerated files. CI runs `npm run design:check`, which includes
   `tokens:check`.

Components must use `var(--…)` custom properties or the Sass abstracts. Stylelint rejects hex colours in `src/app/**`
(`.stylelintrc.json`).

### Add or change an icon

1. Pick an **outline** Tabler icon (see [DD-05](DESIGN_DECISIONS.md#dd-05-tabler-icons-instead-of-lucide)).
2. Add a semantic name → Tabler component entry to `ATLAS_ICONS` in `src/app/shared/icons/atlas-icons.ts`.
3. Use the icon as `<atlas-icon name="semantic-name" />`, or add `[label]` when the icon carries meaning on its own.
4. If you change a Life Dimension icon, update `lifeDimensions.icons` in `design/tokens/design-tokens.json`, run
   `npm run tokens:build` and change the matching `ATLAS_ICONS` entry. A unit test fails if the two disagree. There are
   no separate SVG copies: Life Dimension icons render from `@tabler/icons-angular` like every other icon.

### Regenerate raster assets

1. Edit the SVG master in `design/svg/logo/`. Never edit the PNGs.
2. Run `npm run assets:export`. It renders every output listed in `scripts/assets/asset-manifest.mjs`.
3. Run `npm run assets:validate`, which checks SVG safety, required masters, sizes, alpha and colour space.

See [ASSET_EXPORTS.md](ASSET_EXPORTS.md) for the full table.

### Run all design checks

```sh
npm run design:check   # tokens:check + contrast:check + assets:validate
npm run verify         # design:check + lint + lint:styles + format:check + test:ci + build
npm run e2e            # Playwright + axe on the design-foundation page (starts ng serve on :4200)
```

## Quality gates (design-instructions §16)

| Gate group      | Gate                                                                     | Status                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand & assets  | All logo variants exist as editable SVG                                  | Implemented (`assets:validate`)                                                                                                                                            |
|                 | Symbol recognisable at 16, 24, 32 and 48 px                              | Checked by rendering. 16 px is acceptable for favicon/tab use only ([BRAND_GUIDELINES](BRAND_GUIDELINES.md#minimum-sizes))                                                 |
|                 | Logo works on light and dark; monochrome legible                         | Implemented (on-dark and monochrome variants)                                                                                                                              |
|                 | App icon has no text and respects the safe area                          | Implemented (`assets:validate` rejects `<text>`; adaptive mark inside the safe radius)                                                                                     |
|                 | Raster exports are reproducible                                          | Implemented (`assets:export`). Outputs are not byte-identical across platforms ([DD-17](DESIGN_DECISIONS.md#dd-17-raster-exports-are-derived-and-validated-by-properties)) |
|                 | No external image or font URLs at runtime                                | Implemented (self-hosted `@fontsource` fonts)                                                                                                                              |
| Design system   | Brand colours, seven dimension colours, status colours tokenised         | Implemented. In-progress equals the Career foreground ([DD-10](DESIGN_DECISIONS.md#dd-10-in-progress-status-equals-career-strong))                                         |
|                 | Typography, spacing, radius, elevation and motion tokens                 | Implemented                                                                                                                                                                |
|                 | Components consume tokens, not hard-coded values                         | Enforced for hex colours by Stylelint. Components themselves are planned (step 5)                                                                                          |
| UX & responsive | Eight pages specified for desktop, tablet and mobile                     | Specified ([PAGE_SPECIFICATIONS](PAGE_SPECIFICATIONS.md))                                                                                                                  |
|                 | Sidebar, bottom navigation, list alternatives, timeline collapse, states | Planned (steps 4–6)                                                                                                                                                        |
| Accessibility   | Focus visible, contrast checked, reduced motion, touch-target token      | Implemented in the foundation ([ACCESSIBILITY](ACCESSIBILITY.md))                                                                                                          |
|                 | Keyboard navigation, accessible names, status not colour-only            | Implemented for the existing primitives. Must be re-verified per component                                                                                                 |
|                 | Charts and graphs have text alternatives                                 | Planned                                                                                                                                                                    |
| Platform        | Angular production build passes                                          | Covered by `npm run verify`                                                                                                                                                |
|                 | Capacitor web build, iOS/Android icon catalogs, simulator, safe areas    | Planned (step 7). No native platforms have been added yet                                                                                                                  |

## Principles (design-instructions §18)

1. **Big picture first.** Users understand the overall direction before task detail.
2. **Progressive disclosure:** Destination → Waypoint → Step.
3. **One visual language** across all modules.
4. **Colour has meaning.** Dimension accents identify life areas, semantic colours identify status, and gold highlights
   meaningful achievements.
5. **Motivation through clarity**, not pressure, streak manipulation or noisy gamification.
6. **Connections matter**, but uncertain forecasts are never presented as facts.
7. **Mobile is first-class.** Do not squeeze a desktop dashboard onto a phone.
8. **Accessible by design.** Every visualisation and interaction has an accessible alternative.
9. **Editable source assets.** SVG masters and tokens, not screenshots.
10. **Consistency beats novelty.**
