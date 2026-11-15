# ADR-0003: UI component stack — Angular 22, Angular Material/CDK, SCSS tokens, Capacitor 8

- Status: Accepted
- Date: 2026-11-12
- Deciders: @hsnrzv (owner)

## Context

`project-instruction.md` §9.1 proposes Angular 22, Angular Material + CDK, SCSS with CSS custom properties and Material
theming, Capacitor 8 and no Ionic UI. It warns that PrimeNG's newer releases moved to PrimeUI packages under a
Community License (§9.6). `design-instructions.md` §10.3 requires theming Material through supported APIs, preventing
default Material colours from leaking, avoiding broad `::ng-deep`, and keeping Capacitor adjustments in a dedicated
stylesheet. The app must be accessible (WCAG 2.2 AA), responsive from 390 px phones to desktop, and run inside
Capacitor WebViews.

Verified on 2026-11-12 (npm registry): `@angular/core` 22.2.6, `@angular/material`/`@angular/cdk` 22.2.7,
`@capacitor/core`/`@capacitor/cli` 8.6.0, TypeScript 6.0.3 (inside Angular 22.2's supported range).

## Decision

- **Angular 22.2** with standalone components, lazy routes, `OnPush` (the Angular 22 default), zoneless change
  detection, signals for local and feature state, and strict TypeScript plus `strictTemplates`. No NgRx until state
  complexity proves the need (§10.1).
- **Angular Material 22 (Material 3) + CDK** for functional controls: forms, dialogs, menus, tabs, tables, overlays and
  tooltips. Material is the component _foundation_, not the visual identity:
  - `src/styles/material/_theme.scss` applies `mat.theme()` with palettes generated from Atlas tokens
    (`_theme-colors.scss`). It then remaps the M3 system colours (primary and container roles, surfaces, outline,
    error) and component tokens (button and card shapes, focus indicators) to Atlas semantic CSS variables. Light and
    dark themes therefore follow `html[data-theme]` without a second Material theme.
  - Strong focus indicators (`mat.strong-focus-indicators`, 2 px solid) are enabled globally. They take the mapped
    primary colour (`--color-action-primary`: midnight in light mode, gold in dark mode).
- **Styling:** SCSS with design tokens emitted as CSS custom properties (ADR-0007). Global `styles.scss` contains only
  fonts, tokens, the Material theme and base layers (reset, typography classes, accessibility, platform safe areas).
  Components consume tokens; Stylelint forbids raw colour literals under `src/app`. **No Tailwind or other utility
  framework**, no Ionic UI, no PrimeNG/PrimeUI.
- **Fonts are self-hosted** through Fontsource packages (Inter Variable and, since ADR-0010, Manrope Variable; DM Serif Display was removed) and bundled by the
  Angular build. No Google Fonts CDN: this keeps the strict CSP (`font-src 'self'`), avoids a third-party request, and
  works offline in Capacitor.
- **Capacitor 8.6** (`@capacitor/core`, `@capacitor/cli`) provides native packaging. App id `dev.myatlas.app`,
  `webDir dist/atlas-frontend/browser`. Native `ios/`/`android/` projects and plugins are added in Phase 10, not now.
- **Brand components:** `<atlas-logo>` (inline SVG symbol and live-text wordmark, automatic inverse in dark theme,
  forced-colours safe) and `<atlas-icon>` (ADR-0005).

## Consequences

- One accessible, well-maintained component set under MIT, with Angular-native APIs and CDK primitives for custom
  components (overlay, a11y, layout, drag-drop).
- Making Material look like Atlas needs deliberate token mapping. It is done once in `_theme.scss` and verified visually
  on the design-foundation page in light and dark mode. Material major upgrades need a review of that mapping.
- The baseline production bundle is 267.7 kB raw / 70.6 kB transfer initial, plus a 229 kB lazy chunk for the
  design-foundation page (2026-11-12). Budgets are a 500 kB warning and 1 MB error for initial, and 4 kB / 8 kB per
  component style.
- Production builds disable critical-CSS inlining (`optimization.styles.inlineCritical: false`). Beasties would emit
  an inline `onload` handler that the strict CSP (`script-src 'self'`) blocks.
- Mobile-specific UX (bottom navigation, safe areas, keyboard resize) is plain Angular and CSS. There is no Ionic
  component layer.

## Alternatives considered

- **Ionic Framework UI + Capacitor:** strong native look and feel, but a second component system with its own theming
  next to Material. The spec explicitly does not require it (§9.1).
- **PrimeNG / PrimeUI:** a rich component set, but new major releases use a Community License with eligibility and
  renewal terms (§9.6). Historical MIT releases would age out.
- **Headless primitives + Tailwind:** maximum visual freedom, but more components to build and test for accessibility,
  plus a utility framework the design spec asks to avoid.
- **Google Fonts CDN:** simpler, but it needs CSP exceptions, makes third-party requests and does not work offline.

## References

- `project-instruction.md` §1.2, §9.1, §9.6, §10.1–§10.3
- `design-instructions.md` §3, §10.3, §11, §12
- Angular versions and compatibility: <https://angular.dev/reference/versions> (accessed 2026-11-12)
- Angular Material theming (M3): <https://material.angular.dev/guide/theming> (accessed 2026-11-12)
- Capacitor 8 upgrade guide: <https://capacitorjs.com/docs/updating/8-0> (accessed 2026-11-12)
- ADR-0005 (icons), ADR-0007 (tokens), ADR-0008 (tests)
