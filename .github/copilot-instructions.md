# Copilot instructions — `atlas` (IKIGAI ATLAS frontend)

Read these before changing code. They are binding.

- Product and architecture spec: `project-instruction.md` (phases §18, Definition of Done §19, open decisions §21).
- Design system: `design-instructions.md`, plus the `design/` package (tokens, SVG masters, component and page specs).
- Decisions: `docs/adr/` (ADR-0005 Tabler icons, ADR-0006 UI vocabulary, ADR-0007 tokens as source of truth).
- Plans: `docs/plan/PLAN-FRONTEND.md` (backlog IDs `F…`) and `docs/plan/IMPLEMENTATION-ROADMAP.md`.
  Implement one backlog item per PR. Do not start a later phase before its gate is approved.

## Rules

- Angular 22: standalone components, signals, `OnPush`, lazy feature routes, typed reactive forms, no NgModules.
- Use the UI vocabulary in the UI and the domain terms in code and API models (ADR-0006). For example, the UI says
  "Destination" and "Waypoint"; the code says `Goal` and `GoalNode`.
- Styling: only design tokens (`--color-*`, `--space-*`, `--radius-*`, `--typescale-*`, …) through
  `@use 'abstracts' as atlas;`. No hard-coded colours, spacing or font sizes. Change tokens in `design/tokens/*.json`
  and run `npm run tokens:build`. Never edit `*.generated.*` files.
- Icons: Tabler through the `AtlasIcon` component and its registry (`src/app/shared/icons`); Life Dimension
  icons from `design/svg/dimensions`.
- Accessibility: WCAG 2.2 AA. Every interactive element is keyboard-reachable with a visible focus ring and an
  accessible name. Never use colour alone to convey meaning. Respect `prefers-reduced-motion`.
- Security: no tokens in `localStorage`/`sessionStorage`; no inline scripts or `eval` (the CSP allows
  `script-src 'self'` only); no third-party origins without a CSP change in `nginx/security-headers.conf`; no
  `innerHTML` with user content; no `bypassSecurityTrust*` without an ADR.
- The frontend never does financial or progress calculations. It displays values the backend has derived.
- Dependencies: only permissive licenses (see `docs/architecture/DEPENDENCY-LICENSE-MATRIX.md` §1). Update
  `THIRD-PARTY-NOTICES.md` in the same PR. The lockfile must resolve from `registry.npmjs.org` only.

## Verify before finishing

```sh
npm run verify   # lockfile, tokens/contrast, lint, stylelint, prettier, unit tests, production build
npm run e2e      # Playwright + axe
```
