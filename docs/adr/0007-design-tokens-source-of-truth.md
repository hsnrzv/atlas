# ADR-0007: Design tokens in JSON are the single source of truth

- Status: Accepted; amended by [ADR-0010](0010-figma-visual-source-of-truth.md) (Figma V3 is the visual source; the
  JSON stays the single source in code; Manrope replaces DM Serif Display)
- Date: 2026-11-12
- Deciders: @hsnrzv (owner)

## Context

`design-instructions.md` §10.1 makes JSON tokens canonical and asks that CSS custom properties are generated or
maintained from them, without divergent manual copies. Token groups: palette, semantic, dimension and status colours;
typography; spacing; radius; elevation; motion; breakpoints; layout; z-index. §11 targets WCAG 2.2 AA contrast. The
Angular Material theme (ADR-0003) needs palettes derived from the same colours. A dark theme is specified (§2.4).

## Decision

- **Source:** `design/tokens/*.json` (`colors`, `typography`, `spacing`, `elevation`, `motion`, `layout`, the
  `design-tokens.json` manifest with Life Dimension metadata, and `contrast-pairs.json`).
- **Generator:** `scripts/design-tokens/build-tokens.mjs` (`npm run tokens:build`) is plain Node with no extra
  dependency. It writes, and these outputs are committed:
  - `src/styles/tokens/_tokens.generated.scss`: CSS custom properties on `:root` (light) and
    `[data-theme='dark']` (semantic overrides).
  - `src/styles/tokens/_breakpoints.generated.scss`: breakpoint map for the `abstracts` mixins.
  - `src/app/shared/design-system/tokens.generated.ts`: typed constants for TypeScript (for example charts later).
- **Material palettes:** `src/styles/material/_theme-colors.scss` (M3 tonal palettes) is **not** produced by `tokens:build`. It was
  generated once with `ng generate @angular/material:theme-color` from the brand colours. Re-run that schematic when a
  brand primitive changes. The Material system tokens are mapped onto the Atlas semantic variables in
  `src/styles/material/_theme.scss`, so the palettes only affect tones that Atlas does not override.
- **Naming:** primitives (`--color-brand-midnight-900`), semantics (`--color-text-primary`, `--color-surface-card`),
  dimensions (`--color-dimension-career`, `…-strong`, `…-tint`), status, typography (`--typescale-*`), spacing
  (`--space-*`), radius, shadows, motion, layout and z-index. Components use **semantic** tokens.
- **Gates (CI, `npm run design:check`):** `tokens:check` fails if the generated files differ from the JSON.
  `contrast:check` evaluates every pair in `contrast-pairs.json` against WCAG thresholds (85 pairs, 2026-11-12): 4.5:1 for
  text, 3:1 for large text and non-text UI; `info` pairs are reported only. Pairs cover light and dark. `icons:check` and `assets:validate` cover the dimension SVGs and raster exports.
  Stylelint forbids raw colours in `src/app`.
- **Theme switching:** `html[data-theme='dark']`, set by the `AtlasTheme` service. The user-preference policy (system,
  stored choice, default) is an open decision for the app shell phase.

## Consequences

- One edit in JSON updates CSS, TypeScript and Material consistently. Reviewers see token diffs and their generated
  effect in the same PR.
- Contrast regressions are caught before merge. Generated files are marked `linguist-generated` in `.gitattributes`.
- The custom generator is roughly 300 lines to maintain. It can be replaced by Style Dictionary if token needs grow
  (for example a native iOS/Android token export), without changing token names.

## Alternatives considered

- **Style Dictionary / Tokens Studio:** industry-standard, multi-platform output, but more dependencies and config for
  two outputs we need today. Reconsider for native token exports.
- **Hand-written SCSS variables only:** simplest, but the specification forbids divergent manual copies and contrast
  could not be gated automatically.
- **Material theme as the source:** convenient for Material, but it cannot express Life Dimension, status or layout
  tokens, and it would couple brand to library.

## References

- `design-instructions.md` §2, §3, §4, §10, §11, §16
- WCAG 2.2 contrast (SC 1.4.3, 1.4.11): <https://www.w3.org/TR/WCAG22/> (accessed 2026-11-12)
- `design/README.md`, ADR-0003
