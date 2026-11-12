# PLAN-FRONTEND — `atlas` (Angular 22 + Capacitor 8)

- Status: **Phase 0 plan for owner review.** Phase 1 foundations are partly delivered (2026-11-12, uncommitted).
- Scope owner: `atlas` repository. Cross-repo sequencing: [IMPLEMENTATION-ROADMAP](IMPLEMENTATION-ROADMAP.md).
- Sources: `project-instruction.md` §3, §9–§10, §13, §16–§19; `design-instructions.md` §0–§16; ADR-0002…0008.

## 1. Scope

**In scope (this repository):**

- Angular client for web/PWA and, through Capacitor, iOS and Android: app shell, navigation, pages for My Atlas,
  Destinations, Waypoints, Steps, Connections, Journey Overview, Milestone Awards and Life Dimensions, onboarding,
  finance/capacity views, and exports.
- Design system: tokens, theme, brand assets, reusable components, `design/` documentation.
- Typed data-access layer: a mock adapter first (one sample Destination), then an HTTP adapter over the backend
  `/api/v1` contract.
- Frontend tests, the frontend container image, frontend CI, and later mobile CI.
- Cross-repository documentation (CONTEXT, roadmap, dependency/license matrix, cross-cutting ADRs).

**Out of scope here:** business rules owned by the backend (progress calculation, dependency validation, unlock
rules and financial projections are computed server-side and displayed as returned), migrations, cluster config and
secrets.

**This session (Phase 0 + Phase 1 foundations, design steps 1–3):** no app shell, no pages, no features. See the
backlog for what was delivered and what remains.

## 2. Assumptions

1. A single owner uses the app at first. The UI is in **English**. Formatting uses `Intl` with the profile
   locale and currency once the profile exists (open decision D7).
2. The backend is reached **same-origin** under `/api/v1` in every web environment (ADR-0002), so no CORS and no API
   URL per environment.
3. Authentication will be a BFF session cookie for the web and PKCE in the system browser for native apps
   (`atlas-microservices` ADR-0005, proposed). The frontend never handles passwords or stores tokens in Web Storage.
4. Domain calculations (progress, unlocks, impacts) are done by the backend. Until Phase 4, the mock adapter returns
   precomputed values, so components never calculate them.
5. Supported browsers follow Angular 22's support policy. The Capacitor 8 minimum iOS/Android WebView versions are
   **to verify** in Phase 10.
6. The repository names, versions and runtime contract in ADR-0002 are fixed for Phases 1–4.

## 3. Proposed structure (packages and files)

Delivered structure in **bold**. Everything else is created only when its backlog item starts (no empty folders).

```text
design/                         **tokens/*.json, svg/logo, svg/dimensions, exports/**, README + docs (design package)
scripts/                        **design-tokens/, assets/, check-lockfile-registry.mjs**
src/styles.scss                 **fonts → tokens → Material theme → base layers**
src/styles/                     **abstracts/ base/ material/ tokens/(generated)**; platform/capacitor partial (F2)
src/app/
  app.ts, app.config.ts, app.routes.ts   **root (router outlet), providers, lazy routes**
  core/                         singletons — layout/ (shell), navigation/, http/ (interceptors, problem-details),
                                config/, error-handling/, auth/ (Phase 4/9), accessibility/ (live announcer)
  shared/
    brand/                      **<atlas-logo>**
    icons/                      **<atlas-icon>, ATLAS_ICONS**
    design-system/              **LIFE_DIMENSIONS, ATLAS_STATUSES, AtlasTheme, tokens.generated.ts**
    ui/                         DimensionBadge, StatusBadge, ProgressIndicator, DateLabel, EmptyState,
                                LoadingSkeleton, ErrorState, PageHeader, Breadcrumbs, ConfirmDialog (F2)
    charts/ timeline/ calendar/ wrappers (Phase 5, ADR-0004)
  features/
    my-atlas/                   dashboard page + view model (F2)
    destinations/               data-access/ (GoalRepository port, mock + http adapters), models/, pages/, components/
    waypoints/ steps/ connections/ journey/ awards/ life-dimensions/ onboarding/   (as their phase starts)
  design-system/                **design-foundation page** → dev-only route `/_design` once the shell exists (F1-14)
e2e/                            **Playwright specs**
nginx/, Dockerfile              **container**
.github/workflows/              **frontend-ci.yml, frontend-container.yml**; mobile-validation.yml (Phase 10)
```

**Data-access boundary (Phase 2 → 4).** `features/destinations/data-access` defines a `GoalRepository` port
(an injection token plus an interface using the API-shaped models `Goal`, `GoalNode` and `GoalReward`). There are two
adapters: `MockGoalRepository` (one development-only sample Destination, §10.5) and `HttpGoalRepository` (Phase 4).
Pages map API models to view models; components receive view models only. The mock adapter and the sample data are
provided only in the `development` build configuration and in e2e. The production build cannot import them, which a
unit test and a bundle grep in CI assert.

## 4. Dependencies

| Dependency                                                                           | Needed for                          | Status                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------ |
| Backend draft API contract (`atlas-microservices/docs/architecture/API-CONTRACT.md`) | model shapes in F2-2                | draft (Phase 0)                            |
| Published OpenAPI document and generated or adapted client                           | F4-1                                | Phase 3 (backend)                          |
| Authentication decision and BFF endpoints (`/api/v1/me`, login/logout, CSRF cookie)  | F4-5, Phase 9                       | `atlas-microservices` ADR-0005 proposed    |
| Edge/Ingress same-origin routing, local full stack                                   | e2e against the real backend (F4-6) | delivered in `atlas-infra` (local compose) |
| GHCR publishing and promotion PRs                                                    | deploying the image                 | `atlas-infra` ADR-0007 proposed            |
| Owner decisions D1–D14 below                                                         | as listed                           | open                                       |

Runtime npm dependencies today: Angular 22.2, Material/CDK 22.2, Capacitor core 8.6, Tabler Icons Angular 3.51,
Fontsource Inter/DM Serif Display, rxjs, tslib. Planned: the Phase 5 visualization packages (ADR-0004), and possibly
`@angular/service-worker` (D6), Angular Testing Library (ADR-0008) and an OpenAPI type generator (D3). See
[DEPENDENCY-LICENSE-MATRIX](../architecture/DEPENDENCY-LICENSE-MATRIX.md).

## 5. Sequence

1. **Phase 1 (finish):** responsive app shell with placeholder routes for the eight navigation areas (design step 4),
   the dev-only design route, and the theme preference.
2. **Phase 2:** shared UI primitives → API-shaped models and mock repository → My Atlas → Destinations list/detail →
   Waypoint drill-down with breadcrumbs and lock state → Steps and status change → Milestone Award display → list-based
   Journey Overview → responsive e2e flows on three engines.
3. **Phase 3** (parallel to backend Phase 3, still mock-backed): Destination create/edit/archive/delete forms → nested
   Waypoint/Step editing → notes panel → onboarding wizard → OpenAPI client spike against the backend's published
   contract.
4. **Phase 4:** typed client and `HttpGoalRepository` → loading/empty/error/retry and Problem Details → optimistic
   updates where safe → auth-ready HTTP layer → e2e against the full stack in CI → mock removed from non-dev builds.
5. Phases 5–10 are outlined in §11 and refined when Phase 4 exits.

## 6. Test approach

| Level                 | Tool                                                                                              | What                                                                                                                                     | Gate         |
| --------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Static                | ESLint (angular-eslint, typescript-eslint), Stylelint, Prettier, `tsc` strict + `strictTemplates` | code and style rules; no raw colours in `src/app`                                                                                        | CI `verify`  |
| Design system         | `design:check`                                                                                    | tokens in sync, 85 WCAG contrast pairs, dimension icons and brand assets                                                                 | CI `verify`  |
| Unit/component        | Vitest via `ng test` (jsdom)                                                                      | registries, view-model mappers, date-precision and currency formatting, components' inputs/outputs and accessible names, mock-data guard | CI `verify`  |
| E2E                   | Playwright (desktop + Pixel 7 Chromium now; Firefox and WebKit from F2-10)                        | §17.1 flows as they arrive: navigation overview → Destination → Waypoint → nested and back; CRUD; unlock; onboarding; responsive layout  | CI `e2e`     |
| Accessibility         | `@axe-core/playwright` (WCAG 2.0–2.2 A/AA), light and dark                                        | zero violations on every routed page; plus manual keyboard and screen-reader checks in the PR checklist                                  | CI `e2e`     |
| Container             | `frontend-container.yml`                                                                          | build, `/healthz`, deep link, CSP header, `/api` 404, non-root                                                                           | CI           |
| Integration (Phase 4) | Playwright against `atlas-infra/local` compose                                                    | real backend and database flows                                                                                                          | CI (Phase 4) |
| Visual regression     | deferred (D11)                                                                                    | —                                                                                                                                        | —            |

The API is mocked only at the data-access boundary (§17.1).

## 7. Security implications

- **CSP** (`nginx/security-headers.conf`): `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`
  (needed by Angular Material and component styles); `img-src 'self' data:`; `connect-src 'self'`;
  `frame-ancestors 'none'`. Critical-CSS inlining is disabled so no inline scripts are emitted. Any relaxation needs
  an ADR.
- **XSS:** rely on Angular sanitisation. `bypassSecurityTrust*` and `innerHTML` with user content are forbidden
  without review. User notes are rendered as text (Markdown rendering, if ever, needs a sanitiser decision).
- **Tokens and secrets:** none in the bundle or Web Storage (§0.4). The web session uses an HttpOnly cookie. CSRF
  uses Angular `HttpClient` XSRF support (`XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header), matching Spring Security's
  cookie CSRF repository defaults (to confirm in F4-5).
- **Sensitive data in the client:** no persistence of domain data in Local Storage or IndexedDB until an offline
  decision is made (D6). The theme preference is the only stored value (D1).
- **Supply chain:** lockfile pinned to the public registry (`lockfile:check`), Dependabot (npm, Actions, Docker),
  `dependency-review` failing on high severity, and a license review for each new dependency.
- **Container:** non-root (uid 101), read-only root filesystem compatible (verified), no `/api` handling in the
  frontend container, `server_tokens off`, plus the security headers above.

## 8. Deployment implications

- **One immutable image for every environment** (`ghcr.io/hsnrzv/atlas-frontend`). No build-time environment URLs,
  because the API is same-origin. If runtime configuration becomes necessary (OIDC client hints, feature flags), serve
  `/config.json` from a ConfigMap (D4) instead of rebuilding.
- Caching: hashed bundles and fonts are `immutable` for 1 year; `index.html` and SPA routes are `no-cache`. A new
  deployment is therefore picked up on the next navigation, and old chunks must stay available for in-flight
  sessions. A rolling update keeps that brief. Revisit with the service worker (D6).
- Kubernetes probes use `GET /healthz`. The image needs `emptyDir` at `/tmp` and `/var/cache/nginx` with
  `readOnlyRootFilesystem` (already in `atlas-infra/apps/frontend`).
- Mobile builds (Phase 10) bundle the same `dist/atlas-frontend/browser`. Their API origin is not same-origin
  (Capacitor scheme), so this needs CORS and an auth design (D5).

## 9. Risks

| Risk                                                                                                                             | Impact                  | Mitigation                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Material M3 overrides drift on Material upgrades                                                                                 | visual regressions      | overrides centralised in `_theme.scss`; design-foundation page plus axe in e2e; review Material changelogs in Dependabot PRs |
| Visualization libraries (vis-timeline peers, FullCalendar v7 restructure) conflict with Angular 22, the CSP or the bundle budget | Phase 5 delay           | spike first (ADR-0004), wrappers isolate libraries, native SVG fallback                                                      |
| Capacitor WebView differences (Safari/WebKit CSS, safe areas, keyboard)                                                          | mobile layout bugs      | WebKit e2e project from F2-10; safe-area tokens already in `base/_platform.scss`; device testing in Phase 10                 |
| Mock and real API drift                                                                                                          | Phase 4 rework          | models mirror the backend draft contract; contract-first spike in F3-5; mapping isolated in data-access                      |
| Sample data leaking into production                                                                                              | trust and privacy issue | mock only in `development` config; CI asserts it is absent from the production bundle                                        |
| Complex visualizations not accessible                                                                                            | WCAG failure            | list/table alternatives are part of every wrapper's contract; axe plus manual review                                         |
| Private npm mirror URLs re-entering the lockfile                                                                                 | CI/Docker failures      | `lockfile:check` in `verify` and CI                                                                                          |
| Single maintainer; spec is large                                                                                                 | stalled progress        | PR-sized backlog, one phase at a time, gates in the roadmap                                                                  |

## 10. Acceptance criteria (measurable)

**Phase 1 (frontend) is done when:**

- [x] `npm run verify` passes on a clean clone (`npm ci`): lockfile guard, design checks, ESLint, Stylelint,
      Prettier, unit tests, production build.
- [x] `npm run e2e` passes on desktop and mobile Chromium with **zero axe WCAG 2.2 AA violations** in light and dark.
- [x] Initial production bundle ≤ 500 kB raw (budget warning). Measured: 267.7 kB raw / 70.6 kB transfer.
- [x] The container builds, runs as non-root and passes the smoke checks (`/healthz` 200, deep link 200, CSP header,
      `/api/*` 404); it also runs with a read-only root filesystem. Image size 60.8 MB (≤ 100 MB target).
- [x] Every WCAG contrast pair in `contrast-pairs.json` passes; the brand and platform assets validate.
- [ ] The responsive app shell with placeholder routes renders the eight navigation areas at 390 px, 768 px and
      1280 px with no horizontal overflow, keyboard-reachable navigation and a working skip link (F1-14).
- [ ] CI is green on GitHub for the first PR (workflows have not run yet; nothing is pushed).

**Phase 2:** the user can navigate My Atlas → Destination → Waypoint → nested Waypoint and back by breadcrumbs. Sample
data appears only in development/demo mode. Desktop/tablet/mobile smoke tests pass on Chromium, Firefox and WebKit.
axe reports zero violations on all routes. Initial transfer size is ≤ 150 kB.

**Phase 3 (frontend part):** forms for Destination CRUD, nested Waypoint/Step editing, notes and onboarding pass
validation, keyboard and e2e tests against the mock adapter. The client spike produces types from the published
OpenAPI document without manual edits.

**Phase 4:** all Phase 2/3 flows pass against the real backend and database (`atlas-infra/local` in CI) with no
demo-only domain data. Loading, empty, error and retry states are covered by e2e. Problem Details errors render
field-level messages. The production bundle contains no mock code (CI check).

## 11. Backlog (PR-sized)

Legend: `[x]` delivered in this session (uncommitted, verified locally) · `[ ]` open. IDs are referenced from the
roadmap.

### Phase 1 — foundations

- [x] **F1-1** Angular 22.2 scaffold (standalone, zoneless, strict TS + `strictTemplates`), npm scripts, `.nvmrc`,
      `engines`, `.editorconfig`, `.gitattributes`, Prettier.
- [x] **F1-2** Capacitor 8.6 core/cli and `capacitor.config.ts` (`dev.myatlas.app`); native projects deferred to
      Phase 10.
- [x] **F1-3** ESLint (`ng lint` incl. e2e/config files), Stylelint (SCSS, no raw colours in `src/app`).
- [x] **F1-4** Design tokens JSON → SCSS/TS/Material palette generator; contrast gate (ADR-0007).
- [x] **F1-5** Brand SVG masters (17), the Life Dimension icon set (7), raster exports for favicon/PWA/Capacitor/social,
      and asset validation.
- [x] **F1-6** Material M3 theme mapped to tokens (light/dark), fonts self-hosted, base layers (reset, typography,
      accessibility, platform safe areas), Sass abstracts.
- [x] **F1-7** `<atlas-icon>` and the semantic Tabler registry (ADR-0005).
- [x] **F1-8** `LIFE_DIMENSIONS`, `ATLAS_STATUSES`, the `AtlasTheme` service and `<atlas-logo>`.
- [x] **F1-9** Temporary design-foundation page at `/`; unit tests (11); Playwright + axe (10 tests).
- [x] **F1-10** Dockerfile (Node 26 build → nginx-unprivileged), nginx SPA config, `/healthz`, CSP and security
      headers.
- [x] **F1-11** CI: `frontend-ci.yml` (verify, e2e, dependency review), `frontend-container.yml` (build + smoke),
      Dependabot, CODEOWNERS, PR template (DoD §19).
- [x] **F1-12** README, CONTRIBUTING, SECURITY, THIRD-PARTY-NOTICES; ADRs 0001–0008; CONTEXT, roadmap, this plan,
      dependency/license matrix.
- [x] **F1-13** `design/` documentation package (README, decisions, brand guidelines, accessibility, responsive
      behaviour, component catalogue, page specifications, asset exports, shell mock-ups).
- [ ] **F1-14** Responsive app shell (design step 4): `AppShell`, `DesktopSidebar` (expanded/collapsed rail),
      `TopBar`, `MobileBottomNavigation` (My Atlas, Destinations, Journey, Awards, More), placeholder pages for the eight
      areas, skip link, route titles, the design-foundation page moved to the dev-only `/_design` route, and the theme
      preference (D1). e2e: no overflow at 390/768/1280, keyboard navigation, axe.
- [ ] **F1-15** First push and PR: confirm the workflows run green on GitHub, enable branch protection and
      security settings (SECURITY.md), and publish GHCR images once `atlas-infra` ADR-0007 is accepted.

### Phase 2 — shell content and one sample Destination (mock-backed)

- [ ] **F2-1** Shared UI primitives: `DimensionBadge`, `StatusBadge` (icon + text), `ProgressIndicator` (accessible
      value text), `DateLabel`, `EmptyState`,
      `LoadingSkeleton`, `ErrorState`, `PageHeader`, `Breadcrumbs`. Component tests and a section on `/_design`.
      `DateLabel` renders the backend `PlannedDate` (`{ date, precision }`, precision `DAY`/`MONTH`/`QUARTER`/`YEAR`/
      `APPROXIMATE`; API-CONTRACT §5) and never shows more precision than given.
- [ ] **F2-2** API-shaped models (`Goal`, `GoalNode` incl. `availability`, `GoalReward`, `LifeDimensionKey`,
      `PlannedDate`, `Money` with string `amount`) from the backend draft contract (API-CONTRACT §5, §9; reviewed with
      backend BE-2.1); `GoalRepository` port; `MockGoalRepository` with the **single** §10.5 sample Destination
      (generic placeholders, no invented curriculum or dates); dev-only provider; production-bundle guard test.
- [ ] **F2-3** My Atlas page: Life Dimension overview, active Destinations, next Waypoints, upcoming deadlines,
      Milestone Award preview; responsive grid.
- [ ] **F2-4** Destinations list and `DestinationCard` (progress, next Waypoint, dimension, target period, award
      preview).
- [ ] **F2-5** Destination detail: Waypoint path (native SVG/CSS), progress breakdown (backend-provided values), notes
      preview.
- [ ] **F2-6** Waypoint focus and drill-down to any depth, breadcrumbs, lock/unlock visual state with explanation
      text, deep links (`/destinations/:id/waypoints/:nodeId`).
- [ ] **F2-7** Steps list/rows with status change through the repository port (mock), live-region announcement.
- [ ] **F2-8** Milestone Award card states (planned/earned/redeemed), before and after achievement.
- [ ] **F2-9** Journey Overview v0: accessible chronological list grouped by period (the interactive timeline comes in
      Phase 5).
- [ ] **F2-10** E2E: overview → Destination → Waypoint → nested → back; responsive smoke at 390/768/1280; add
      Firefox and WebKit projects; axe on every route.
- [ ] **F2-11** Supply-chain gates in `frontend-ci`: a production-tree license allow-list check (DEPENDENCY-LICENSE-MATRIX
      §1; tool and license to verify), a CycloneDX SBOM, and an image scan with the scanner chosen together with
      `atlas-infra` and the backend (BE-1.13).
- [ ] **F2-12** `frontend-container.yml` publishes `main-<sha>` to GHCR on `main` (provenance, SBOM and scan from
      F2-11) and opens the bump PR to `atlas-infra` `environments/dev`. Starts once `atlas-infra` ADR-0007 is accepted.

### Phase 3 — editing and onboarding (frontend, parallel to backend Phase 3)

- [ ] **F3-1** Destination create/edit/archive/delete (Material forms, validation messages, confirm dialog).
- [ ] **F3-2** Nested Waypoint/Step create/edit/reorder/delete; dependency picker (Connections within a Destination).
- [ ] **F3-3** Notes panel for Destinations and Waypoints (backend stores Markdown text, BE-3.60; rendering per D13);
      due dates with precision.
- [ ] **F3-4** Onboarding wizard (editable, skippable): profile basics, Life Dimension selection and labels, first
      Destination.
- [ ] **F3-5** OpenAPI client spike against the backend's committed snapshot (`atlas-microservices/docs/api/openapi.json`,
      BE-3.05/BE-3.82): generator choice (D3), CI step that fails on contract drift.

### Phase 4 — integration with the backend

- [ ] **F4-1** Typed API client and `HttpGoalRepository`; repository provider switched by build configuration.
- [ ] **F4-2** HTTP layer: base path `/api/v1`, Problem Details (RFC 9457, `urn:problem:atlas:*` codes) → typed
      errors → form and field messages, retry for idempotent GETs, global error handling, and money display from string
      amounts through `Intl.NumberFormat` (no client arithmetic).
- [ ] **F4-3** Deliberate loading/empty/error/retry states on every page. Optimistic updates send `If-Match` with
      the last `ETag`; on `412 VERSION_CONFLICT` the client reloads and tells the user. Creates and completions send an
      `Idempotency-Key` (API-CONTRACT §7–§8, BE-4.3).
- [ ] **F4-4** Onboarding, Destination/Waypoint/Step CRUD, completion and unlock, notes and awards wired to the
      backend.
- [ ] **F4-5** Auth-ready client: `withCredentials`/same-origin cookies, XSRF configuration, a 401 → sign-in
      redirect hook, and a `/me` bootstrap (behind a flag until Phase 9).
- [ ] **F4-6** E2E against `atlas-infra/local` compose in CI; seed through the API, not demo data.
- [ ] **F4-7** Remove the mock adapter from non-development builds; CI bundle check.

### Later phases (outline, refined at the Phase 4 exit)

- **Phase 5:** visualization spike and ADR-0004 acceptance → `ChartHost`, `JourneyTimeline`, `DeadlineCalendar`, each
  with a text/list alternative; dense-data and narrow-viewport tests.
- **Phase 6:** finance baseline and planned impacts UI, capacity warning (explanatory).
- **Phase 7:** export UI (roadmap PNG/JPEG, calendar PDF); renderer spike (§21.8).
- **Phase 8:** domain extension features (career, property, fitness, freelance, trading learning, hobbies,
  relationship) as separate lazy features.
- **Phase 9:** identity hardening with the chosen OIDC provider; **F9-3** third-party license page (serve
  `3rdpartylicenses.txt` and the OFL texts); PWA service worker decision (D6); production CSP review.
- **Phase 10:** `@capacitor/ios` and `@capacitor/android` projects, plugins (secure storage, browser), splash/icon
  from `design/exports/capacitor`, `mobile-validation.yml`, store metadata.

## 12. Open decisions (recommended default · trade-offs)

| ID  | Decision                                                                                                            | Recommended default                                                                                                                                                                                                                                                                                            | Trade-offs                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| D1  | Theme preference                                                                                                    | Follow `prefers-color-scheme` until the user picks light or dark; store only that choice in `localStorage` (non-sensitive)                                                                                                                                                                                     | system-only is simpler but gives no control; server-stored preference needs auth first                                    |
| D2  | Where the design-foundation page lives after F1-14                                                                  | dev-only route `/_design`, excluded from production routes                                                                                                                                                                                                                                                     | Storybook would document components better but adds a toolchain the design spec discourages unless justified              |
| D3  | API client generation                                                                                               | Generate **types only** (for example `openapi-typescript`, license and version to verify) and keep thin hand-written services                                                                                                                                                                                  | full generators (openapi-generator `typescript-angular`, orval) add more code and lock-in; hand-written types alone drift |
| D4  | Runtime configuration                                                                                               | none until needed; then `/config.json` from a ConfigMap, loaded before bootstrap                                                                                                                                                                                                                               | build-time `environment.ts` needs one image per environment, which breaks digest promotion                                |
| D5  | Native API origin and auth for Capacitor (`capacitor://localhost` / `https://localhost`, to verify for Capacitor 8) | decide with the Phase 9/10 auth spike (API-CONTRACT §13): PKCE in the system browser, bearer tokens in secure storage, explicit CORS allow-list for exactly the app origins, or the native HTTP plugin                                                                                                         | a native BFF via cookies in the WebView is fragile across platforms                                                       |
| D6  | PWA/offline (service worker)                                                                                        | defer until after auth (Phase 9); online-only before that                                                                                                                                                                                                                                                      | an early service worker complicates auth and cache invalidation; the manifest already enables "Add to Home Screen"        |
| D7  | Locale, currency, date formats                                                                                      | English UI; `Intl` formatting from the profile locale and currency; Angular i18n deferred                                                                                                                                                                                                                      | full i18n now costs effort with no current second language                                                                |
| D8  | Analytics or telemetry                                                                                              | none (privacy by default); maybe privacy-preserving error reporting later                                                                                                                                                                                                                                      | no usage insight; errors visible only through user reports and backend logs                                               |
| D9  | Repository LICENSE                                                                                                  | owner decision; keep "all rights reserved" until chosen                                                                                                                                                                                                                                                        | an open-source license enables contributions but publishes personal-project code terms                                    |
| D10 | Browser and WebView support matrix                                                                                  | Angular 22's default browserslist; Capacitor 8 platform minimums (to verify in Phase 10)                                                                                                                                                                                                                       | wider support means more testing; narrower may exclude older iPhones                                                      |
| D11 | Visual regression testing                                                                                           | Playwright screenshot assertions for key pages from Phase 3, Linux CI only                                                                                                                                                                                                                                     | flaky across OS fonts; a hosted service costs money                                                                       |
| D12 | Angular Testing Library                                                                                             | add with the first interactive component (F2-1) if tests get simpler                                                                                                                                                                                                                                           | one more dev dependency; Angular's harnesses cover Material components already                                            |
| D13 | Rendering of notes (backend stores Markdown text)                                                                   | MVP: plain text with preserved line breaks; Markdown later only with a sanitising renderer (library and license to verify) and no raw HTML                                                                                                                                                                     | Markdown improves readability, but every renderer is an XSS surface and adds bundle size                                  |
| D14 | Mapping domain node status to UI status (`ATLAS_STATUSES`)                                                          | `statusForNode()` adapter in F2-2: `COMPLETED`→success, `IN_PROGRESS`→in-progress, `NOT_STARTED`→not-started, or upcoming when due soon; `availability.state = LOCKED`→blocked; at-risk only from a backend-derived flag. Add neutral `skipped` and `cancelled` UI statuses (icon + label, new tokens) in F2-1 | the UI never derives progress or risk itself (backend R-4); two more status tokens to keep within the contrast gate       |
