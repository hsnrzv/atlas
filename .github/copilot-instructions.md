# Copilot instructions — `atlas` (IKIGAI ATLAS frontend)

Read these before changing code. They are binding.

- Product and architecture spec: `project-instruction.md` (phases §18, Definition of Done §19, open decisions §21).
- Visual design: the Figma V3 file `zlFVZJ57AYBHUBhoIsT030` wins on visual styling (ADR-0010). Start with
  `docs/design/figma-handoff.md` (pages, node IDs, states, flows, MCP workflow), `docs/design/component-mapping.md`
  (Figma component → Angular) and `docs/design/design-tokens.md` (Figma variables → tokens). Never paste
  Figma-generated React/Tailwind code; build native Angular components. Figma is design-time context only: never
  add Figma APIs, tokens, packages, sync scripts or CI steps to the app or the build.
- Design system: `design-instructions.md`, plus the `design/` package (tokens, SVG masters, component and page specs).
- Frontend architecture: `docs/architecture/frontend.md` (layers, routing, data-access ports and adapters, state,
  forms, companion, theming).
- Decisions: `docs/adr/` (ADR-0005 Tabler icons, ADR-0006 UI vocabulary, ADR-0007 tokens, ADR-0009 Signal Forms,
  ADR-0010 Figma as visual source).
- Plans: `docs/implementation/roadmap.md` (phase order and gates), `docs/plan/PLAN-FRONTEND.md` (backlog IDs `F…`)
  and `docs/plan/IMPLEMENTATION-ROADMAP.md`.
  Implement one backlog item per PR. Do not start a later phase before its gate is approved.

## Rules

- Angular 22: standalone components, signals, `OnPush`, lazy feature routes, Signal Forms (`@angular/forms/signals`,
  ADR-0009) with Material form fields, no NgModules.
- Presentational components (`shared/ui`, `shared/visualization`, `features/*/components`) take inputs and emit
  outputs only. Pages read feature signal stores; stores call repository ports in `core/data-access`.
- Use the UI vocabulary in the UI and the domain terms in code and API models (ADR-0006). For example, the UI says
  "Destination" and "Waypoint"; the code says `Goal` and `GoalNode`.
- Styling: only design tokens (`--color-*`, `--space-*`, `--radius-*`, `--typescale-*`, …) through
  `@use 'abstracts' as atlas;`. No hard-coded colours, spacing or font sizes. Token values follow the Figma variables
  (design-time translation in `docs/design/design-tokens.md` §6); change them in `design/tokens/*.json` and run
  `npm run tokens:build`. Never edit `*.generated.*` files.
- Icons: Tabler through the `AtlasIcon` component and its registry (`src/app/shared/icons`), Life Dimension
  icons included (glyph names in `design/tokens/design-tokens.json → lifeDimensions.icons`). No icon webfont.
- Accessibility: WCAG 2.2 AA. Every interactive element is keyboard-reachable with a visible focus ring and an
  accessible name. Never use colour alone to convey meaning. Respect `prefers-reduced-motion`.
- Security: no tokens in `localStorage`/`sessionStorage`; no inline scripts or `eval` (the CSP allows
  `script-src 'self'` only); no third-party origins without a CSP change in `nginx/security-headers.conf`; no
  `innerHTML` with user content; no `bypassSecurityTrust*` without an ADR.
- The frontend never does financial or progress calculations. It displays values the backend has derived.
- Mock data lives only in the dev-only mock adapter (`core/data-access/mock`), never in components or stores, and
  never in production bundles (CI bundle guard). It contains only the single sample Destination from
  `project-instruction.md` §10.5. Never invent financial figures or AI-style responses; finance stays
  "Illustrative · unverified" and companion copy is static.
- Dependencies: only permissive licenses (see `docs/architecture/DEPENDENCY-LICENSE-MATRIX.md` §1). Update
  `THIRD-PARTY-NOTICES.md` in the same PR. The lockfile must resolve from `registry.npmjs.org` only.

## Verify before finishing

```sh
npm run verify   # lockfile, tokens/contrast, lint, stylelint, prettier, unit tests, production build
npm run e2e      # Playwright + axe
```
