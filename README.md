# IKIGAI ATLAS — frontend (`atlas`)

> See the whole. Shape what matters.

Angular client for **IKIGAI ATLAS**: a private, responsive planning app that turns long-term life goals into a visual
roadmap and shows how they affect time, money and the user's Life Dimensions. The same Angular build runs as a web
app/PWA and, through Capacitor, as iOS and Android apps.

This repository also owns the **design system** (`design/`) and the **cross-repository documentation**: system context,
implementation roadmap, dependency/license matrix and cross-cutting ADRs.

> **Status: Phase 0 (plans, ADRs) + Phase 1 foundations.** There is no application shell and no product feature yet.
> The root route shows a temporary _design foundation_ page (tokens, type, Life Dimensions, status, icons, Material
> components) that verifies the theme. Plans and open decisions are waiting for owner review:
> [IMPLEMENTATION-ROADMAP](docs/plan/IMPLEMENTATION-ROADMAP.md).

## Repository map

| Repository                                                             | Purpose                                                                   | Image                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| **`atlas`** (this repo)                                                | Angular 22 + Capacitor 8 client, design system, cross-repo docs           | `ghcr.io/hsnrzv/atlas-frontend` |
| [`atlas-microservices`](https://github.com/hsnrzv/atlas-microservices) | Spring Boot backend — a **modular monolith**; the repo name is historical | `ghcr.io/hsnrzv/atlas-backend`  |
| [`atlas-infra`](https://github.com/hsnrzv/atlas-infra)                 | Local full-stack Compose, Kubernetes/Kustomize, Argo CD, runbooks         | —                               |

## Prerequisites

| Tool                | Version                              | Notes                                                            |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Node.js             | 26 (see `.nvmrc`)                    | `nvm use`; `engines.node` is `>=26`                              |
| npm                 | 11.x (`packageManager: npm@11.12.1`) | ships with Node 26                                               |
| Docker              | any recent Engine/Desktop            | only for the container image and the full stack                  |
| Playwright browsers | installed on demand                  | `npx playwright install chromium` before the first `npm run e2e` |

Backend and database are **not** needed to work on the current foundation. For the full stack, use
[`atlas-infra/local`](https://github.com/hsnrzv/atlas-infra/tree/main/local).

## Quick start

```bash
nvm use                 # Node 26
npm ci                  # install exactly what package-lock.json pins
npm start               # http://localhost:4200 (proxies /api → http://localhost:8080)
npm run verify          # everything CI's verify job runs, in the same order
```

> **Private npm mirror?** `package-lock.json` must resolve only from `https://registry.npmjs.org/`.
> CI and the Docker build cannot reach private mirrors. If your `~/.npmrc` points to a mirror, npm still installs
> from it locally (npm rewrites the default registry host), but never commit mirror URLs.
> `npm run lockfile:check` enforces this.

## Commands

| Command                           | What it does                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm start`                       | Dev server on `:4200` with `/api` proxied to the backend on `:8080` (`proxy.conf.json`)      |
| `npm run build`                   | Production build to `dist/atlas-frontend/browser`                                            |
| `npm test` / `npm run test:ci`    | Unit and component tests (Vitest via `@angular/build:unit-test`), watch / single run         |
| `npm run e2e`                     | Playwright smoke and axe (WCAG 2.2 AA) tests, desktop and mobile Chromium; starts `ng serve` |
| `npm run lint`                    | ESLint (`angular-eslint`, `typescript-eslint`) for `src`, `e2e` and config files             |
| `npm run lint:styles`             | Stylelint (SCSS; raw colours are forbidden in `src/app`)                                     |
| `npm run format` / `format:check` | Prettier write / check                                                                       |
| `npm run design:check`            | Tokens in sync, WCAG contrast pairs, dimension icons in sync, brand/platform assets valid    |
| `npm run tokens:build`            | Regenerate SCSS/TS tokens and the Material palette from `design/tokens/*.json`               |
| `npm run icons:sync`              | Re-export the seven Life Dimension SVGs from the pinned Tabler release                       |
| `npm run assets:export`           | Re-render PNG/ICO exports (favicons, PWA, Capacitor, social) from the SVG masters            |
| `npm run lockfile:check`          | Fails if `package-lock.json` resolves anything outside the public npm registry               |
| `npm run verify`                  | `lockfile:check` → `design:check` → lint → stylelint → prettier → unit tests → build         |

Container image (nginx-unprivileged, port 8080, SPA fallback, `GET /healthz`, strict CSP):

```bash
docker build -t atlas-frontend:local .
docker run --rm -p 18081:8080 atlas-frontend:local   # http://localhost:18081
```

## Project structure

```text
design/                     design system source of truth (see design/README.md)
  tokens/*.json             colour, type, spacing, radius, elevation, motion, layout, contrast pairs
  svg/logo, svg/dimensions  brand SVG masters and the seven Life Dimension icons
  exports/                  generated PNG/ICO deliverables (Capacitor, PWA, social)
  mockups/                  reference mock-ups (not used at runtime)
docs/
  adr/                      cross-cutting and frontend ADRs
  architecture/             CONTEXT.md, TECH-STACK.md, DEPENDENCY-LICENSE-MATRIX.md
  plan/                     PLAN-FRONTEND.md, IMPLEMENTATION-ROADMAP.md
e2e/                        Playwright specs
nginx/                      container nginx config and security headers (CSP)
public/                     favicon, PWA manifest and icons
scripts/                    token pipeline, asset export/validation, lockfile guard
src/
  styles.scss               global entry: fonts, generated tokens, Material theme, base styles
  styles/abstracts          Sass mixins: breakpoints, typography, a11y (import via @use 'abstracts')
  styles/base               reset, typography classes, focus/skip link/reduced motion, safe areas
  styles/material           Angular Material M3 theme mapped onto Atlas tokens
  styles/tokens             GENERATED — do not edit
  app/shared/brand          <atlas-logo>
  app/shared/icons          <atlas-icon> and the semantic Tabler icon registry
  app/shared/design-system  Life Dimensions, statuses, theme service, generated TS tokens
  app/design-system         temporary design-foundation page (replaced by the app shell in Phase 1/2)
capacitor.config.ts         app id dev.myatlas.app; native projects are added in Phase 10
```

## Working with the design system

- Change tokens only in `design/tokens/*.json`, then run `npm run tokens:build` and `npm run contrast:check`. The
  generated SCSS/TS files and `src/styles/material/_theme-colors.scss` are checked in, and CI fails if they drift.
- Components use the generated CSS custom properties (`var(--color-…)`, `var(--space-…)`, `var(--radius-…)`, …) and
  the `abstracts` mixins, never raw colours or sizes. The dark theme redefines the semantic variables under
  `html[data-theme='dark']`.
- Use icons through `<atlas-icon name="…">` with the semantic names in `src/app/shared/icons/atlas-icons.ts`
  ([ADR-0005](docs/adr/0005-icon-library-tabler.md)).
- UI copy uses the design vocabulary (_My Atlas, Destination, Waypoint, Step, Connection, Journey Overview, Milestone
  Award, Life Dimension_). API and domain names stay as the backend defines them
  ([ADR-0006](docs/adr/0006-ui-vocabulary-and-domain-mapping.md)).

## Documentation

- Product and architecture specification: [`project-instruction.md`](project-instruction.md)
- UI/UX design specification: [`design-instructions.md`](design-instructions.md) and the [`design/`](design/README.md) package
- [System context and containers](docs/architecture/CONTEXT.md) ·
  [Tech stack and architecture graphic](docs/architecture/TECH-STACK.md) ·
  [Implementation roadmap](docs/plan/IMPLEMENTATION-ROADMAP.md) ·
  [Frontend plan](docs/plan/PLAN-FRONTEND.md) ·
  [Dependency and license matrix](docs/architecture/DEPENDENCY-LICENSE-MATRIX.md) ·
  [ADRs](docs/adr/README.md)
- [Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md) · [Third-party notices](THIRD-PARTY-NOTICES.md)

## License

No license has been chosen yet; this is an open owner decision (see the roadmap). Until then, all rights are reserved
by the owner.
