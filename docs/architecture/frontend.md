# Frontend architecture — `atlas`

- Status: approved 2026-11-14 with the decisions in [roadmap §4](../implementation/roadmap.md#4-decisions-final-2026-11-14)
- Scope: the Angular + Capacitor client in this repository. The backend lives in `atlas-microservices` and the
  deployment in `atlas-infra` ([ADR-0002](../adr/0002-repository-topology-and-ownership.md)).
- Inputs: `project-instruction.md`, [TECH-STACK.md](TECH-STACK.md), [CONTEXT.md](CONTEXT.md),
  [PLAN-FRONTEND.md](../plan/PLAN-FRONTEND.md), ADRs 0003–0008, Figma V3
  ([figma-handoff.md](../design/figma-handoff.md))
- Delivery order: [roadmap.md](../implementation/roadmap.md)

## 1. Goals and constraints

1. **Faithful to Figma V3** in both themes and at 390 / 768 / 1440 px, built from native Angular components and design
   tokens ([component-mapping.md](../design/component-mapping.md), [design-tokens.md](../design/design-tokens.md)).
2. **Backend decides the numbers.** Progress, availability, money, capacity and dates are derived by the backend and
   displayed as given. The client never invents financial data or AI-style insights.
3. **Swappable data source.** Pages talk to repository ports. A dev-only mock adapter serves the one sample
   Destination; the HTTP adapter replaces it without touching components.
4. **One codebase for web and native** through Capacitor; the web build is the product.
5. **WCAG 2.2 AA**, strict CSP (`script-src 'self'`), permissive licences only.

## 2. Stack

| Concern       | Choice                                                                             | Reference             |
| ------------- | ---------------------------------------------------------------------------------- | --------------------- |
| Framework     | Angular 22.2, standalone, zoneless, signals, `OnPush`, strict templates            | TECH-STACK            |
| UI behaviour  | Angular Material 22 (M3) and CDK, restyled by tokens                               | ADR-0003              |
| Styling       | SCSS with CSS custom properties from `design/tokens`; `@use 'abstracts' as atlas;` | ADR-0007 (+ ADR-0010) |
| Icons         | Tabler through `<atlas-icon>` and the semantic registry                            | ADR-0005              |
| Forms         | **Signal Forms** (`@angular/forms/signals`) with Material form fields              | ADR-0009              |
| Visualisation | ECharts / vis-timeline per spec §9, or native SVG; decided by a spike (§11)        | ADR-0004, roadmap T-A |
| Native shell  | Capacitor 8.6 (core/CLI now; iOS/Android projects in roadmap phase 7)              | F1-2, Phase 10        |
| Tests         | Vitest (+ Angular Testing Library from F2-1a), Playwright + axe                    | ADR-0008, D12         |

## 3. Layers

```
pages (containers)         features/<area>/pages        route components; read stores, handle user intent
  │
components (presentational) shared/ui, features/<area>/components, shared/visualization
  │                         inputs/outputs only; no services, no data access
stores (state)             features/<area>/data-access/*.store.ts   signals; call ports; expose view models
  │
ports (contracts)          core/data-access/ports        abstract classes / InjectionTokens per aggregate
  │
adapters                   core/data-access/http (prod)  ·  core/data-access/mock (dev only)
  │
models                     core/models                   API-shaped types (Goal, GoalNode, …) + mappers
```

Rules:

- A layer depends only on layers below it. ESLint `no-restricted-imports` enforces that `shared/**` and
  `features/*/components/**` never import `data-access`, `mock` or `HttpClient`.
- Features never import each other. Shared code moves to `shared/` or `core/`.
- **View models** are built in stores by pure functions (`toDestinationCardVm(goal)`) that only reshape and format
  (labels, `Intl` dates). They do not compute progress or amounts.
- Domain names in code (`Goal`, `GoalNode`, `GoalReward`, `GoalLink`), UI names in templates and copy
  ([ADR-0006](../adr/0006-ui-vocabulary-and-domain-mapping.md)).

## 4. Folder structure

```
src/app/
  app.ts, app.config.ts, app.routes.ts
  core/
    layout/            app-shell, sidebar, nav-item, topbar, bottom-nav, navigation, title strategy, route focus,
                       plan-links (UI routes for a Goal or GoalNode)
    data-access/
      ports/           goal.repository.ts, dashboard.repository.ts, profile.repository.ts, …
      http/            http-goal.repository.ts, problem-details.ts, interceptors
      mock/            mock-goal.repository.ts, mock-plan-state.ts, sample-plan.ts, sample-fixtures.ts (dev only, §6)
      testing/         plan-testing.ts: providers for specs (mock responder, mock goal repository, en-US)
      goal-plan.store.ts                 one Destination's plan; shared by the Destination, Waypoint and Step pages
      data-access.providers.ts           provideAtlasData() switches adapters
    plan/              PlanEditor: opens the plan dialogs and confirmations, reports write results
    models/            goal.ts, goal-node.ts, planned-date.ts, money.ts, life-dimension.ts, status-for-node.ts
    theme/             atlas-theme (light / dark / match device)
    companion/         companion-preferences.store.ts (§9)
  shared/
    ui/                buttons are Material; badges, progress, page-header, breadcrumbs, feedback-state, cards, …
    visualization/     waypoint-route, connection-graph, journey-timeline (+ wrappers or SVG per §11)
    icons/             atlas-icon, atlas-icons (exists)
    brand/             atlas-logo (exists)
    design-system/     life-dimensions, statuses, tokens.generated (exists)
  features/
    atlas/ destinations/ waypoints/ steps/ connections/ journey/ awards/ dimensions/ onboarding/ settings/
      pages/ components/ data-access/ (stores) feature.routes.ts
  design-system/       design-foundation → /_design (dev only)
```

`AtlasTheme` moved to `core/theme` in F1-14. The theme choice lives in the topbar profile menu (Match device, Light, Dark)
and is stored in `localStorage` (a preference, not a token).

Until a feature lands, its route renders `features/placeholder` (F1-14). `features/more` is the mobile More page and
`features/not-found` the `**` page.

## 5. Routing

All feature routes are lazy (`loadChildren` → `feature.routes.ts`, `loadComponent` per page). Every route has a
`title` ("Destinations · IKIGAI ATLAS"). Router options: `withComponentInputBinding()` (route params as inputs),
`withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`, `withViewTransitions()` only when reduced motion
is off. A `TitleStrategy` and a focus handler move focus to the page `h1` after navigation.

| Route                                     | Page                                    | Figma area         | Notes                                                               |
| ----------------------------------------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `/` → `/atlas`                            | redirect                                | —                  | `/welcome` instead when onboarding is incomplete (guard, F3-4)      |
| `/atlas`                                  | `AtlasOverviewPage`                     | 05 My Atlas        |                                                                     |
| `/destinations`                           | `DestinationsPage`                      | 06                 | filters as query params                                             |
| `/destinations/:goalId`                   | `DestinationDetailPage`                 | 06                 | one page: purpose, route, Steps, notes, reward; create/edit dialogs |
| `/destinations/:goalId/waypoints/:nodeId` | `WaypointDetailPage`                    | 07                 | any depth: `:nodeId` is the focused node; breadcrumbs from ancestry |
| `/destinations/:goalId/steps/:nodeId`     | `StepDetailPage`                        | 08                 | full page; a Milestone id redirects to the Waypoint page            |
| `/waypoints`                              | `WaypointsPage`                         | 07                 | `?destination=`                                                     |
| `/steps`                                  | `StepsPage`                             | 08                 | `?destination=&waypoint=&status=&due=`                              |
| `/connections`                            | `ConnectionsPage`                       | 09                 | `?view=graph\|list`, `?selected=`                                   |
| `/journey`                                | `JourneyPage`                           | 10                 | `?range=3m\|6m\|1y\|3y\|all`, `?dimension=`                         |
| `/awards`                                 | `AwardsPage`                            | 11                 |                                                                     |
| `/dimensions`, `/dimensions/:key`         | `DimensionsPage`, `DimensionDetailPage` | 12                 | `:key` is the `LifeDimensionKey`                                    |
| `/welcome`                                | `WelcomePage` → `OnboardingPage`        | 14 Getting started | skippable                                                           |
| `/settings`, `/settings/companion`        | settings pages                          | 14 Companion       |                                                                     |
| `/profile`, `/help`                       | placeholder pages                       | 04 (profile menu)  | reached from the profile menu and More                              |
| `/more`                                   | `MorePage`                              | 04 mobile          | lists the areas that are not in the bottom nav                      |
| `/_design`                                | `DesignFoundation`                      | 02/03              | dev builds only (D2); `canMatch` on `devTools`; outside the shell   |
| `**`                                      | `NotFoundPage`                          | —                  | uses `FeedbackState`                                                |

The spec's API paths (`/goals/:goalId/nodes/:nodeId`) are API addresses, not UI routes. UI routes use the UI
vocabulary.

## 6. Data access: ports, mock and REST adapters

### 6.1 Ports

Each aggregate has an abstract class used as the DI token:

```ts
export abstract class GoalRepository {
  abstract list(query?: GoalQuery): Observable<GoalSummary[]>;
  abstract get(goalId: GoalId): Observable<Goal>;
  abstract tree(goalId: GoalId): Observable<GoalTree>;
  abstract completeNode(
    goalId: GoalId,
    nodeId: NodeId,
    cmd: CompleteNodeCommand,
  ): Observable<GoalNode>;
  // create, update, archive, … added with F3-1/F3-2
}
```

Ports mirror `/api/v1` resources (`/dashboard`, `/profile`, `/onboarding`, `/ikigai/areas`, `/goals`,
`/goals/{id}/nodes`, `…/complete`, `…/reopen`, `…/tree`). Models follow the backend contract: `PlannedDate { date,
precision }`, `Money { amount: string, currency }`, statuses and link types as string unions.

### 6.2 Adapters and selection

- `HttpGoalRepository` (F4-1) uses `HttpClient` with a base path from `API_BASE_URL` (`/api/v1`, same origin), maps
  Problem Details to typed errors, and sends `If-Match` / `Idempotency-Key` where the contract requires.
- `MockDashboardRepository` and `MockGoalRepository` (F2-2) serve **only** the single sample from
  `project-instruction.md` §10.5 (described in
  [figma-handoff.md §6](../design/figma-handoff.md#6-sample-data-shown-in-figma)). `MockResponder` adds 400 ms latency
  and reads a query flag once at start-up, so every Figma state can be reviewed and the mode survives in-app
  navigation: `?mock=sample` (default), `empty`, `loading` (never answers), `error` (every request fails) and
  `refresh-error` (the first request succeeds, later ones fail: the Error state with the last saved plan).
- `provideAtlasData()` registers the adapters from `core/data-access/data-source.ts`. In development builds
  `angular.json` `fileReplacements` swaps in `data-source.development.ts`, which picks the mock when
  `environment.dataSource` is `'mock'`. The production file never references `core/data-access/mock/**`. Until the
  HTTP adapters land (F4-1), production uses `Unavailable*Repository`: every call fails with an `AtlasDataError` of
  kind `unavailable`, so pages show their Error state.
- `ATLAS_SAMPLE_DATA` (root token, `false` by default) is `true` only while the mock serves the sample. Pages use it
  for the "Sample plan ·" label from Figma.
- `/_design` lives in `src/app/dev-routes.development.ts`. Production builds use the empty `dev-routes.ts`, so the
  design page and its sample copy never ship.
- The ESLint boundaries allow imports of `core/data-access/mock/**` only from `core/data-access`. `shared/**` and
  `features/*/components/**` must not import data access. Feature specs use their own fixtures
  (`features/*/testing/`).
- **Bundle guard (CI):** `npm run bundle:check` (`scripts/check-bundle-no-mock.mjs`, part of `npm run verify` and
  the CI build job) fails if the production bundle contains the mock sentinel (`ATLAS_MOCK_SENTINEL`) or the sample
  Destination title.

### 6.3 Derived values in the mock

Flows D and G in Figma show progress changing after a Step completes (3/5 → 60 %). The backend owns that rule, and
parts of it are still open (`project-instruction.md` §21 #6: skipped and partially completed work). The mock therefore
contains **no progress rule** (roadmap R-6, R-12). It serves backend-shaped, **precomputed fixture values** transcribed
from Figma in `core/data-access/mock/sample-fixtures.ts`: the initial values (20 %, 40 %, …) and, for the scripted
flows, the response the backend would return after the change (for example 3/5 → 60 %). A change outside those
scripts updates the node status only; derived values stay as they are. Components and stores never compute progress.
The fixtures are deleted with the mock (F4-7).

### 6.4 What the mock must not do

- No invented financial amounts, rates or totals: finance values are absent and the UI says "Illustrative ·
  unverified".
- No AI-like text, scores or insights; companion copy is static (§9).
- No extra sample Destinations, curricula or dates beyond the §10.5 sample.
- "Use sample details" (form) and "Explore sample plan" (onboarding) exist only in dev builds, behind the same
  environment flag.

### 6.5 Proposed contract additions (frontend questions FQ-1 … FQ-13)

Figma pages 05–08 show values that the draft `GET /api/v1/dashboard` contract (API-CONTRACT §9.1) does not provide.
Only the backend can derive them (roadmap R-12), so the frontend models them as **proposed** additions
(marked "Proposed (FQ-n)" in `core/models/dashboard.ts` and `progress.ts`). The mock serves Figma's values for them.
The backend owner decides each question before F4-1. If one is rejected, its UI element is removed. The frontend
never derives it.

| ID   | Proposed field                                                                                   | Shown on page 05                                            |
| ---- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| FQ-1 | `activeGoals[].nextNode` gains `nodeType`, `status`, `availability.state`, `dueDate`, `progress` | Next Waypoint card: status chip, planned date, progress     |
| FQ-2 | `lifeBalance[].progress` (`null` when the area has no active Destination)                        | Life dimension cards                                        |
| FQ-3 | `summary { activeGoals, achievedWaypoints }`, `activeGoals[].achievedWaypoints`                  | At a glance; hero "Waypoints achieved"                      |
| FQ-4 | `inProgress[]` (Steps in progress); `recentAchievements[].nodeType`                              | Recent progress ("Completed · Step", "In progress")         |
| FQ-5 | `progress.excludedNodes[]`                                                                       | Progress policy caption ("… is excluded from progress")     |
| FQ-6 | `activeGoals[].keyDates[]` (later Waypoints with their planned date or `null`)                   | Timing line ("Receive admission decision · date not set …") |

Pages 06–08 (Phase 5) raise further questions. Until they are decided, the UI leaves the element out or uses the
contract's existing field, as listed:

| ID    | Question                                                               | Until decided                                             |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| FQ-7  | Destination application date (Figma form field) is not in the contract | not in the form                                           |
| FQ-8  | How archived Destinations are returned and shown                       | `archive` is called; lists show active Destinations only  |
| FQ-9  | Note text field name (`body` proposed)                                 | `GoalNote.body`, shown as plain text (D13)                |
| FQ-10 | Status a Step returns to when it is reopened                           | the mock restores the previous status, else `IN_PROGRESS` |
| FQ-11 | Node priority (Figma Steps filter)                                     | no priority filter                                        |
| FQ-12 | Waypoints achieved on a Destination outside the dashboard              | not shown on Destination detail                           |
| FQ-13 | Notes count per Step (Figma Step row "No notes")                       | not shown in the Step row                                 |

## 7. State

- **Signal stores per feature**, written as `@Injectable()` classes provided on the feature route (not root), with
  `signal()`, `computed()` and `resource()` / `rxResource()` for loading. RxJS stays inside adapters and for streams
  (debounced search). No NgRx (no need yet; revisit if cross-feature state appears).
- Store shape: `{ status: 'idle'|'loading'|'ready'|'error', data, error }` exposed as read-only signals plus view-model
  `computed`s. Pages render `FeedbackState` for loading/empty/error with Retry.
- First implementation (F2-3b): `AtlasOverviewStore` loads the dashboard with `rxResource` and exposes
  `state: 'loading' | 'empty' | 'ready' | 'error'`, a display `overview` (from the pure
  `atlas-overview.view-model.ts`, formatting only) and `refreshing`. A `linkedSignal` keeps the last saved plan, so a
  failed refresh shows the Error state beside "Last saved plan" instead of discarding it.
- Writes: store method → port → on success, update local state from the **server response** (no client-side
  re-derivation). Optimistic UI only for Step status toggles, with rollback on error (F4-3).
- Plan pages (Phase 5): `GoalPlanStore` is provided per route and loads one Destination with its nodes, notes and
  progress. `scopeTo(goalId)` drives it from the route input. After every write it reloads the plan and progress
  from the port, so progress and availability always come from the backend. `PlanEditor` (`core/plan`) opens the
  dialogs and confirmations and turns write results into a toast or an inline `PlanAlert`.
- Cross-cutting state in `core`: theme, companion preferences, current user (later).

## 8. Forms

Use **Signal Forms** (`form()`, `schema`, `required`, `validate*`, `submit`, `[formField]` from
`@angular/forms/signals`; public API since Angular 22.0) instead of typed reactive forms. Reasons: the model is a
signal (fits the stores), validation is a schema next to the model, and it is now the recommended API.
[ADR-0009](../adr/0009-signal-forms.md) (accepted 2026-11-14, roadmap R-1) records this and replaces "typed reactive
forms".

- Field wrappers: `mat-form-field` + `matInput` / `mat-select` with `[formField]`. The phase 5 spike (F3-0,
  ADR-0009) confirmed error-state matching and `aria-describedby` with Material.
- Every `mat-form-field` sets `appearance="outline"` (component-mapping §4); a template lint rule enforces it. The
  filled appearance put the dark-theme label below 4.5:1 contrast. There is no app-wide
  `MAT_FORM_FIELD_DEFAULT_OPTIONS`: importing it in `app.config.ts` would move Material form-field and
  `@angular/forms` into the initial bundle.
- Server validation: Problem Details `errors[]` map to field errors through the schema's server-error API.
- Destination form fields from Figma: Name (required), Outcome, Dimension, Status, Target date (`PlannedDate` with
  precision), Why it matters, Reward. Application date waits for FQ-7.

## 9. Companion

The companion is an **optional, decorative helper**: no audio, no AI analysis, no streaks, no points
([figma-handoff.md §5](../design/figma-handoff.md#5-brand-companion-and-export-assets)).

- Preferences (`on` / `muted` / `off`) live in `CompanionPreferencesStore` (core). Until the profile API stores them,
  they are kept in `localStorage` as a non-sensitive UI preference (same rule as the theme, D1).
- Copy is a static, curated catalogue (`features/companion/companion-copy.ts`) keyed by trigger (welcome, step
  completed, waypoint achieved, award earned). Nothing is generated.
- Every appearance offers Dismiss, Mute and Disable. Muted shows a compact card without art; Off hides it.
- **Art:** the Figma companion is raster demonstration art without cleared rights. Behind the feature flag
  `companionArt` (off by default) the card shows a placeholder slot (Atlas symbol). Real art lands only after rights
  clearance, as optimised PNG/WebP in `public/companion/` with `alt=""` (decorative) and text that carries the message.
- Celebration uses a short, optional animation that is disabled under `prefers-reduced-motion`.

## 10. Theming

- Tokens become CSS custom properties on `:root` (light) and `[data-theme='dark']` (dark); Material M3 system
  variables map to them in `styles/material/_theme.scss`.
- `AtlasTheme` sets `data-theme` on `<html>`: the stored choice, else `prefers-color-scheme` (D1, roadmap R-5). Only
  the user's explicit choice is stored in `localStorage`. An inline pre-paint script is not allowed by
  the CSP, so `index.html` ships the dark background via CSS `color-scheme` and `@media (prefers-color-scheme)`
  to avoid a flash.
- The signature edge is a CSS gradient token, used only on the top edge of hero and selected surfaces.

## 11. Visualisation

`project-instruction.md` §9 and ADR-0004 select Apache ECharts (+ `ngx-echarts`) for graphs and vis-timeline for the
Journey time axis, with D3 only as a fallback. That default stands (roadmap R-7). Because Figma V3 defines its own
graph and timeline components (`GraphNode`, `GraphConnector`, `TimelineMarker`), a **time-boxed spike at the start of
P-V1** builds the Connections and Journey frames with the selected libraries and with native SVG, and compares Figma
fidelity, keyboard and screen-reader access, CSP compatibility and bundle size (roadmap trade-off T-A). ADR-0004
records the result. Whatever wins:

- Libraries sit behind Atlas wrapper components in `shared/visualization`; features never import them directly.
- Layout logic owned by Atlas (range bucketing, node grouping) lives in pure, tested functions.
- Every chart has a list/table alternative and keyboard support. Connector types differ by line style and legend
  text, not colour only.
- The Waypoint route (F2-5) is an ordered list styled with CSS/SVG and needs no library.

## 12. Responsive behaviour and Capacitor

- Mobile-first SCSS with breakpoint mixins from tokens (`md` 768, `lg` 1024). Components use container queries
  where the Figma variants change by available width.
- Shell: bottom nav < 768; rail 768–1023; sidebar ≥ 1024. Safe areas through `env(safe-area-inset-*)`.
- Touch targets ≥ 44 px (48 preferred). The keyboard must not hide the focused field (`interactive-widget=resizes-content`
  in the viewport meta, plus `scrollIntoView` on focus in sheets).
- Capacitor: `webDir` is the browser build; iOS/Android projects, `@capacitor/status-bar`, `splash-screen`,
  `keyboard`, and `app` (back button) arrive in roadmap phase 7. No native-only features before then. Tokens and
  auth stay in HttpOnly cookies, never in `localStorage` or Capacitor Preferences.

## 13. Accessibility

WCAG 2.2 AA is a release gate:

- Landmarks, one `h1` per page, skip link, focus moved to `h1` after navigation, `aria-current` on nav and
  breadcrumbs.
- When a page swaps its state template (Loading → Overview, Error after Retry), each state renders its own `h1`. If
  the old `h1` had focus, the page moves focus to the new one after render (`AtlasOverviewPage`), so keyboard and
  screen-reader users do not lose their place (WCAG 2.4.3). Loading regions set `aria-busy`.
- Focus ring 2 px outside (`--color-focus-ring`), visible in both themes.
- Status = icon + text; dimension = glyph + label; connector type = line style + legend.
- Live region announcements for Step completion, saves and errors.
- `prefers-reduced-motion` disables animation; `forced-colors` keeps borders and focus visible.
- axe in Playwright on every route and on `/_design`; manual screen-reader checks (VoiceOver, TalkBack, NVDA) before
  each phase gate.

## 14. Security

- CSP stays `script-src 'self'`, no inline scripts or `eval`; fonts and images are self-hosted. Any new origin needs a
  change in `nginx/security-headers.conf` and review.
- No tokens in web storage; same-origin cookie session with XSRF (F4-5). Only non-sensitive preferences (theme,
  companion) in `localStorage`.
- No `innerHTML` with user content and no `bypassSecurityTrust*` without an ADR. Notes render as plain text (D13).
- Dependencies: permissive licences only, lockfile from `registry.npmjs.org`, THIRD-PARTY-NOTICES updated in the same
  PR (Manrope: OFL 1.1).

## 15. HTTP and errors

- Interceptors: base URL, XSRF, `Accept: application/json`, correlation ID header, Problem Details → `AtlasApiError`
  (`type`, `status`, `code` from `urn:problem:atlas:*`, field errors).
- Retry only idempotent GETs (2 tries, backoff). `412 VERSION_CONFLICT` reloads and informs the user.
- Global error handler logs to the console in dev; production telemetry is a later decision.

## 16. Testing

| Level     | Tool                                                     | What                                                                               |
| --------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Unit      | Vitest                                                   | mappers, view-model builders, layout functions, `statusForNode`, environment flags |
| Component | Vitest + Angular Testing Library (from F2-1a, D12)       | every shared component in each Figma state; inputs/outputs; ARIA                   |
| Store     | Vitest with a fake port                                  | loading/empty/error transitions, writes use server responses                       |
| E2E       | Playwright (Chromium, Pixel 7 Chromium, Firefox, WebKit) | Figma flows A–H, 390/768/1440, dark and light, keyboard only, axe                  |
| Visual    | Playwright screenshots of `/_design` (proposal)          | catches token/regression drift; compared manually with Figma screenshots           |
| Contract  | F3-5 OpenAPI snapshot diff                               | models match the backend contract                                                  |

Browser notes for the e2e suite (`e2e/support/`):

- WebKit skips links on Tab (the macOS default), so keyboard tests use `pressTab()` (Alt+Tab in WebKit). WebKit does
  not focus a button on click, so focus-return tests open overlays from the keyboard.
- Playwright's Firefox build crashes when axe reads the ARIA element reflection properties
  (`ariaLabelledByElements`, …) on a Material `mat-select`. `expectNoAxeViolations()` hides those properties in
  Firefox only, so axe falls back to the `aria-*` id attributes. The audit rules stay the same.
- Firefox may not launch on managed macOS machines. Run it locally through the Playwright server container
  (`PW_TEST_CONNECT_WS_ENDPOINT`); CI runs it natively on Linux.

## 17. Performance budgets

- Initial JS ≤ 500 kB warning / 1 MB error (current `angular.json`); target ≤ 250 kB for the shell + My Atlas.
  Measured after phase 5: 510 kB raw / 128 kB transfer (budget warning). The shell's Material menu, tooltip and
  ripple import CDK overlay and a11y, and esbuild keeps every export the lazy pages use from those modules in the
  initial chunk (dialogs, focus trap, `LiveAnnouncer`). App code adds about 1 kB. Reducing it means a lighter shell
  menu and tooltip; tracked in production-readiness §1.5.
- Component styles ≤ 4 kB warning / 8 kB error.
- Fonts: Inter + Manrope variable, Latin subset, `font-display: swap`, preload only the heading weight used above the
  fold.
- LCP < 2.5 s and INP < 200 ms on a mid-range phone profile; measured in CI with Lighthouse from roadmap phase 7.

## 18. Decisions needed

Listed with owners and defaults in [roadmap.md §4](../implementation/roadmap.md#4-decisions-needed-before-or-during-the-phases).
