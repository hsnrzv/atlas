# Production readiness and store release — frontend

- Scope: everything the `atlas` frontend must do before its first production release on the web, the Apple App Store
  and Google Play. Backend and infrastructure work appears only where the frontend depends on it.
- When to use: start sections 2 and 3 after roadmap phase 9 (all features wired to the real backend). Section 1 is
  the release gate. Section 4 runs in parallel with section 1, once the auth decision for native apps is made.
- Lifetime: sections 2 and 3 are one-time cleanups and are deleted when done. Sections 1 and 4 stay as the release
  runbook (`docs/operations/release.md`, see §3.2).
- Tick an item only with evidence: a command output, a CI run, a test report or a screenshot linked in the release PR.

## 1. Production-readiness checklist

### 1.1 Features and data

- [ ] Every page and flow in Figma V3 is implemented and wired to the real backend through the HTTP adapters. No
      `Unavailable*Repository` is left in `core/data-access`.
- [ ] Every page has deliberate Loading, Empty, Error (with Retry) and not-found states.
- [ ] The frontend does no progress, financial or availability calculations. Every value comes from the API.
- [ ] Each proposed contract addition (FQ-1 … FQ-13, [frontend.md §6.5](../architecture/frontend.md)) is either in
      the backend contract or removed from the model and the UI.
- [ ] Writes send `If-Match` and `Idempotency-Key` where the contract requires them. A 409/412 conflict shows a
      reload prompt instead of overwriting.
- [ ] Section 2 (mock cleanup) is complete: no sample plan, sample copy or mock mode remains in any build.
- [ ] Dates, numbers and money use the profile locale and currency (D7), not the browser default. Money is formatted
      from string amounts with `Intl.NumberFormat` and never parsed into floating point.
- [ ] Companion art: either the owner holds the rights to the final art and `companionArt` is on, or the placeholder
      stays and the flag is removed.

### 1.2 API contract

- [ ] TypeScript types are generated from the backend's committed OpenAPI snapshot. CI fails when the snapshot and
      the types drift.
- [ ] Problem Details (RFC 9457) map to typed errors with user-facing copy. No raw server message is shown.
- [ ] The app works against the oldest backend version still deployed, and the backend keeps `/api/v1` compatible
      with the oldest store app still in use. Store apps cannot be force-updated (see §4.10).

### 1.3 Security

- [ ] Auth is complete and matches the decided model: same-origin cookies, XSRF header and a 401 → sign-in flow on
      the web; PKCE in the system browser with tokens in the iOS Keychain or Android Keystore on native (§4.1).
- [ ] No tokens or personal data in `localStorage`, `sessionStorage` or IndexedDB. Only the theme preference is
      stored.
- [ ] The CSP in `nginx/security-headers.conf` is unchanged or tighter: `script-src 'self'`, no third-party
      origins. The production build emits no inline script.
- [ ] No `innerHTML` with user content, no `bypassSecurityTrust*`, no `eval`. Notes render as plain text.
- [ ] HSTS is set at the edge (Ingress), and HTTPS is enforced end to end.
- [ ] `npm audit --omit=dev` shows no high or critical findings. Dependabot alerts are triaged.
- [ ] The container image scan passes, and the image runs as a non-root user.
- [ ] Source maps are not served publicly: the production configuration keeps `sourceMap` off (only `development`
      enables it in `angular.json`).

### 1.4 Accessibility (WCAG 2.2 AA)

- [ ] axe reports zero violations on every route in both themes at 390, 768 and 1440 px (`npm run e2e`).
- [ ] Manual screen-reader pass on every page: VoiceOver (macOS and iOS), TalkBack (Android), NVDA (Windows).
- [ ] Keyboard only: every action is reachable, the focus order is logical and the focus ring is visible.
- [ ] 200 % zoom and 320 px reflow without loss of content. Forced colours and `prefers-reduced-motion` work.
- [ ] Native: Dynamic Type (iOS) and font scale (Android) at their largest setting keep the content usable.

### 1.5 Performance

- [ ] The production build meets the `angular.json` budgets (initial < 500 kB warning, < 1 MB error) without new
      warnings. Open since phase 5: initial is 510 kB raw ([frontend.md §17](../architecture/frontend.md#17-performance-budgets)).
- [ ] Core Web Vitals budgets pass in CI (`npm run e2e:performance`, mid-range phone profile:
      [frontend.md §17](../architecture/frontend.md#17-performance-budgets)) against the production build and the
      real backend.
- [ ] Lighthouse in Chrome DevTools on the key pages of the deployed staging app: Performance ≥ 90 (mobile profile),
      Accessibility 100, Best Practices ≥ 95. Lighthouse is not an npm dependency (its tree includes the
      source-available `sentry` package), so this check is manual.
- [ ] Every feature route is lazy. Heavy visualisation libraries load only on their pages.
- [ ] A mid-range Android device scrolls and navigates smoothly (frontend.md performance budgets).

### 1.6 Quality gates

- [ ] `npm run verify` and `npm run e2e` pass on `main`.
- [ ] Cross-browser e2e passes on Chromium, Firefox and WebKit.
- [ ] E2E runs against the local full stack (`atlas-infra` local setup), with data seeded through the API.
- [ ] Staging e2e passes against the deployed backend.
- [ ] Visual-regression baselines (`e2e/visual/__screenshots__`) for the key pages in both themes are approved and
      the CI job `visual` passes.
- [ ] `mobile-validation.yml` passes: Android debug build, lint and unit tests; iOS simulator build.

### 1.7 Errors and observability

- [ ] A global `ErrorHandler` shows a calm, recoverable message and never a blank screen.
- [ ] Offline and slow networks show the Error state with Retry, not a spinner that never ends.
- [ ] Error reporting is decided (D8). The default is none. If one is added, it is self-hosted or privacy-preserving,
      collects no personal data, appears in the CSP and in the privacy policy, and its licence is checked.

### 1.8 Legal, privacy and licences

- [ ] `THIRD-PARTY-NOTICES.md` lists every shipped dependency, including Capacitor plugins and fonts. Only
      permissive licences ([DEPENDENCY-LICENSE-MATRIX.md](../architecture/DEPENDENCY-LICENSE-MATRIX.md) §1).
- [ ] `npm run lockfile:check` passes: the lockfile resolves from `registry.npmjs.org` only.
- [ ] The repository licence is decided (D9).
- [ ] The privacy policy, terms of use and imprint are reachable from the app (Help or Profile) and from the store
      listings.
- [ ] The SBOM is generated and attached to the release.

### 1.9 Release mechanics

- [ ] `package.json` `version` is set (semantic versioning, not `0.0.0`). The web image, the iOS build and the
      Android build carry the same version (§4.3).
- [ ] The container image is published to GHCR with provenance, and the `atlas-infra` bump PR is reviewed.
- [ ] Rollback is tested: the previous image tag redeploys through Argo CD, and the store builds use staged rollout
      (§4.10).
- [ ] Section 3 (documentation) is complete, and the release notes are written.

## 2. Mock and development-data cleanup

Goal: after this section, no build, test or document contains the sample plan or a mock mode. Local development runs
against the real backend through `proxy.conf.json` (`/api` → `http://localhost:8080`).

Prerequisite: the HTTP adapters and the auth-ready client are merged, and the local full stack works. Do the cleanup
in one PR (F4-7). It mostly deletes code, so review it for completeness rather than design.

### 2.1 Inventory and action

This table is the single inventory of mock and sample data. Every change that adds or changes mock data, sample data,
sample copy, a fixture, a mock-only mode or a dev-only sample shortcut updates this table in the same PR
(`.github/copilot-instructions.md`).

| Path                                                                                                                                                                                          | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Action                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/core/data-access/mock/` (all files)                                                                                                                                                  | Mock repositories, `MockResponder` (`?mock=`, including the Phase 6 `new` mode for a first visit), sample plan, fixtures, sentinel; since Phase 5 also `MockPlanState` (in-memory plan writes, seeded Step dependency, reopen rule of FQ-10), `SAMPLE_GOAL_DRAFT`, `MOCK_NEW_GOAL_PROGRESS`, `SAMPLE_COMPLETED_AT`; since Phase 6 `SAMPLE_STAGES` (Flow D/G progress by completed application Steps; stage 4 is not drawn in Figma), the availability swap of "Submit the application", `SAMPLE_COMPLETION_TIMES`, `SAMPLE_FINANCE_IMPACT` (illustrative Finance relationship), the timeline, connections, awards and onboarding mocks, and `mock-io.ts`; since the manual-test fixes (2026-11-16) `mock-recalculation.ts` (a stand-in for backend rules: progress, Waypoint status and Step availability are re-derived after every mock write; never port it, the backend owns these rules), the dashboard mock built from every mock Destination with the browser's local date as today, and the `setSecondaryAreas` write that adds a secondary Life Dimension association (Connections connect flow) | **Delete** the folder                                                                                                                                                                                                |
| `src/app/core/data-access/data-source.development.ts`                                                                                                                                         | Selects the mock in development builds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Delete**, and remove its `fileReplacements` entry in `angular.json`                                                                                                                                                |
| `src/app/core/data-access/data-source.ts`                                                                                                                                                     | Production adapter list                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Keep**, now providing only the HTTP adapters                                                                                                                                                                       |
| `src/app/core/data-access/unavailable/`                                                                                                                                                       | Placeholder adapters that always fail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Delete** once every port has an HTTP adapter                                                                                                                                                                       |
| `src/app/core/data-access/sample-goal-draft.ts` (`ATLAS_SAMPLE_GOAL_DRAFT`)                                                                                                                   | Values for the dev-only "Use sample details" button (Destination form)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Delete**. Remove `sampleDraft` from `destinations.store.ts`, the `sample` input and `useSample()` from `GoalFormDialog`, and the button in `goal-form-dialog.html`                                                 |
| `src/app/core/data-access/testing/plan-testing.ts` (`providePlanTesting`)                                                                                                                     | Spec-only providers that serve the sample plan to page specs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **Rewrite** with a spec-only fake `GoalRepository`; update the plan page, store and shared UI specs that use it                                                                                                      |
| `src/app/core/data-access/sample-data.ts` (`ATLAS_SAMPLE_DATA`)                                                                                                                               | Switch for the "Sample plan ·" label                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | **Delete**. Remove `sample` from `atlas-overview.store.ts` and `atlas-overview.view-model.ts`, and the sample block in `atlas-overview-page.html`                                                                    |
| `AtlasEnvironment.dataSource` (`core/config/atlas-environment.ts`, both `src/environments/*.ts`)                                                                                              | `'mock' \| 'http'` switch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **Remove the field**. Keep `devTools`. Keep `companionArt` only if §1.1 keeps the flag                                                                                                                               |
| `eslint.config.js` `mockImports`                                                                                                                                                              | Import boundary for the mock folder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | **Remove** the pattern and its uses                                                                                                                                                                                  |
| `scripts/check-bundle-no-mock.mjs`, `bundle:check` in `package.json` and `frontend-ci.yml`                                                                                                    | Guard against mock data in the production bundle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Keep** as a regression guard. Drop the `ATLAS_MOCK_SENTINEL` entry and keep the sample-title entries                                                                                                               |
| `mock/mock-repositories.spec.ts`, `data-access.providers.spec.ts`                                                                                                                             | Specs of the mock and of the adapter switch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **Delete** the first (with the folder). Rewrite the second to assert the HTTP adapters                                                                                                                               |
| `src/app/app.spec.ts`                                                                                                                                                                         | Uses `provideAtlasData()` with the mock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Rewrite** with a fake `DashboardRepository`, as in `atlas-overview-page.spec.ts`                                                                                                                                   |
| `src/app/features/*/testing/` (for example `dashboard.fixture.ts`)                                                                                                                            | Spec-only fixtures, never shipped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Keep**. Replace any wording copied from the sample plan with neutral test data                                                                                                                                     |
| `e2e/my-atlas.spec.ts` and every e2e spec that uses `?mock=`                                                                                                                                  | Drives page states through the mock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | **Rewrite**: happy paths against the seeded local stack; Loading, Error and refresh failure with Playwright `page.route('**/api/v1/**')` stubs                                                                       |
| `/_design` (`src/app/design-system/`, `dev-routes*.ts`, `e2e/design-foundation.spec.ts`)                                                                                                      | Dev-only component gallery, excluded from production builds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **Keep** as the living style guide. Replace `sampleWaypoint`, `sampleDestination`, the Phase 6 `sampleGraphNodes`, `sampleGraphEdges`, `sampleLanes`, `sampleScale` and the companion demo with neutral placeholders |
| "Explore sample plan" (Welcome and setup pages)                                                                                                                                               | Sample shortcut behind the dev flag                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | **Delete** the action and its copy                                                                                                                                                                                   |
| `src/app/core/data-access/sample-plan-loader.ts` (`ATLAS_SAMPLE_PLAN_LOADER`)                                                                                                                 | Dev-only "Explore sample plan" action of Welcome and setup (Flow A); seeds `MockPlanState`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | **Delete** with the "Explore sample plan" buttons in `features/onboarding/`                                                                                                                                          |
| `mock/mock-read-models.spec.ts`                                                                                                                                                               | Specs of the Phase 6 mocks (Flow G stages, timeline, connections, awards, onboarding)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Delete** with the folder                                                                                                                                                                                           |
| Sample copy in Phase 6 pages: "Sample plan ·" lines of Connections, Journey, Awards and Life Dimensions                                                                                       | Shown only while `ATLAS_SAMPLE_DATA` is `true`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **Delete** with `ATLAS_SAMPLE_DATA`                                                                                                                                                                                  |
| `e2e/plan.spec.ts`                                                                                                                                                                            | Gate 5 flows; creates, edits and deletes Destinations, Waypoints, Steps and notes in the mock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **Rewrite** against the seeded local stack; reset the seeded data between tests                                                                                                                                      |
| "Proposed (FQ-n)" comments in `src/app/core/models/*.ts`                                                                                                                                      | Open contract questions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Remove**. Generated OpenAPI types replace the hand-written fields                                                                                                                                                  |
| `angular.json` `performance` configuration, `playwright.performance.config.ts`, `e2e/performance/`, `scripts/serve-static.mjs`, `e2e:performance` script, `frontend-ci.yml` job `performance` | Optimised build with the dev-only mock adapter (`dist/atlas-performance`, never deployed) that measures Core Web Vitals on the sample plan; timings include the mock's 400 ms latency                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Rewrite**: measure the production build against the seeded local stack (or `page.route` stubs with recorded API responses), then delete the `performance` configuration                                            |
| `e2e/visual/key-pages.spec.ts` and `e2e/visual/__screenshots__/*.png`                                                                                                                         | Visual baselines rendered from the sample plan through `?mock=`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Rewrite**: render the pages from seeded local-stack data, then regenerate and approve the baselines                                                                                                                |
| `design/mockups/*.svg`                                                                                                                                                                        | Early shell mockups                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | **Delete**. Figma and the built app replace them                                                                                                                                                                     |

### 2.2 Verification

```sh
# Nothing may match except the bundle-guard script.
grep -rniE "mock|sample plan|ATLAS_SAMPLE_DATA|Master.s degree in Computer Science" \
  src e2e eslint.config.js angular.json scripts
npm run verify   # includes bundle:check against the production build
npm run e2e      # against the local full stack
npm start        # the app shows only data from the local backend
```

## 3. Documentation cleanup to the final state

Goal: the repository documents the app **as it is**, in the present tense. No phase plans, backlog IDs, gates, dated
decision logs or open questions remain. Git history and closed PRs keep the record.

### 3.1 Rules for the final documents

- Describe the current structure and behaviour. No "decided", "proposed", "pending", "Phase n", "Gate n" or dates.
- No backlog or decision IDs (`F2-3`, `R-6`, `D14`, `FQ-2`, `ADR-0005`) in documents or code comments. Replace each
  with the rule it stands for, or delete it.
- One topic, one document. Link instead of repeating.
- Every document is updated in the same PR as the code it describes. State this rule in `CONTRIBUTING.md`.

### 3.2 Target structure

```text
README.md                         What the app is, quick start, commands, project structure, links to docs/
CONTRIBUTING.md                   Workflow, code rules, Definition of Done, "update docs with code"
SECURITY.md                       Reporting and the security model in short
THIRD-PARTY-NOTICES.md            Licence notices for shipped dependencies
.github/copilot-instructions.md   Binding rules, pointing only at the documents below
.github/pull_request_template.md  Summary, testing, Definition of Done (no roadmap links)
docs/
  README.md                       Index of the documents below
  product.md                      Purpose, scope, UI vocabulary ↔ domain terms, Life Dimensions, status meanings
  architecture/
    overview.md                   System context, the three repositories, runtime, deployment, tech stack
    frontend.md                   Layers, folders, routing, data access, state, forms, theming, visualisation,
                                  accessibility, security, HTTP and errors, testing, performance, native build
    dependencies.md               Licence policy and the dependency list
  design/
    design-tokens.md              Token pipeline and usage
    components.md                 Component inventory: Figma component → Angular component → inputs
  operations/
    release.md                    Sections 1 and 4 of this document, kept as the release runbook
design/                           Tokens, SVG masters, exports and the design-system guides (README, brand,
                                  accessibility, responsive behaviour, component catalogue, page specifications,
                                  asset exports)
```

### 3.3 Actions per existing document

| Document                                                                                       | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/plan/PLAN-FRONTEND.md`                                                                   | **Delete.** First move every rule still in force (for example notes as plain text, locale from the profile, no telemetry) into `frontend.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `docs/plan/IMPLEMENTATION-ROADMAP.md`                                                          | **Delete.** The plan is finished; the release runbook replaces it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `docs/implementation/roadmap.md`                                                               | **Delete**, together with the folder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `docs/adr/` (0000–0010, README)                                                                | **Fold, then delete.** Write each accepted outcome as a present-tense rule in its target document: UI stack and Capacitor → `overview.md`; icons, tokens and Figma as the design-time source → `design/README.md` and `design-tokens.md`; vocabulary → `product.md`; test toolchain and forms → `frontend.md`. **Resolve first:** `atlas-microservices` and `atlas-infra` link to ADR-0002…0007 here as the cross-repository record. Either move the cross-repository decisions to `atlas-infra`, or keep `docs/adr/` here as the one exception. Agree with the owners of the other repositories before deleting |
| `docs/architecture/CONTEXT.md`, `TECH-STACK.md`                                                | **Merge** into `architecture/overview.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `docs/architecture/frontend.md`                                                                | **Rewrite** to the final state. Delete §6.3–6.5 (mock, open contract questions) and §18 (decisions needed). Describe the HTTP adapters, generated API types, auth and the native build. Remove backlog references                                                                                                                                                                                                                                                                                                                                                                                                |
| `docs/architecture/DEPENDENCY-LICENSE-MATRIX.md`                                               | **Rename** to `dependencies.md`. Remove proposed and rejected candidates; list only what is installed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/design/component-mapping.md`                                                             | **Rewrite** as `docs/design/components.md`: built components only, without the backlog column                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `docs/design/figma-handoff.md`                                                                 | **Delete.** Move the still-useful parts (reading Figma through MCP, frame naming) into `design/README.md`. The sample data goes with the mock; deviations that remain become plain behaviour in `components.md`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `docs/design/design-tokens.md`                                                                 | **Keep**; remove history                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `project-instruction.md`                                                                       | **Replace** with `docs/product.md`. Keep the product description, scope, domain model and vocabulary the frontend needs, in the present tense. Drop the roadmap, phase gates, open decisions, research references and Copilot prompts. Backend and infrastructure parts belong in their repositories                                                                                                                                                                                                                                                                                                             |
| `design-instructions.md`                                                                       | **Merge** into `design/README.md` as the single design-system entry point                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `design/DESIGN_DECISIONS.md`                                                                   | **Delete** after moving the rules in force into the matching `design/` guide                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `design/COMPONENT_CATALOG.md`, `PAGE_SPECIFICATIONS.md`                                        | **Update** to the built components and pages; drop "proposed" wording and unbuilt entries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `design/BRAND_GUIDELINES.md`, `ACCESSIBILITY.md`, `RESPONSIVE_BEHAVIOR.md`, `ASSET_EXPORTS.md` | **Keep**; remove history and phase references                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `README.md`                                                                                    | **Update** the Documentation and Project structure sections to match §3.2; remove roadmap and ADR links                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `.github/copilot-instructions.md`, `.github/pull_request_template.md`, `CONTRIBUTING.md`       | **Update** the links to the new documents. Replace "project-instruction §19" with the Definition of Done in `CONTRIBUTING.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Code comments (about 28 files in `src`, `e2e`, `scripts` and config)                           | **Remove** backlog, decision and section references (`F2-2`, `R-12`, `D14`, `frontend.md §6.5`); keep the explanation the reference stood for                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `docs/release/production-readiness.md` (this document)                                         | **Move** sections 1 and 4 to `docs/operations/release.md` without IDs, then delete this file                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.4 Verification

```sh
# No plan or decision identifiers, phases, gates or proposals remain.
grep -rnE "\b(F[0-9]-[0-9]+[a-z]?|R-[0-9]+|D[0-9]{1,2}|FQ-[0-9]|ADR-[0-9]{4})\b|Phase [0-9]|Gate [0-9]|roadmap|Proposed" \
  docs design README.md CONTRIBUTING.md .github src e2e scripts
# Every relative link resolves (one-off check, not a project dependency).
npx --yes markdown-link-check -q README.md docs/**/*.md design/*.md
npx prettier --check .
```

## 4. Technical steps before the App Store and Google Play release

The store apps use the same Angular build. Capacitor 8 wraps it in native iOS and Android projects
(`capacitor.config.ts`: `appId: dev.myatlas.app`, `webDir: dist/atlas-frontend/browser`). Store rules and platform
minimums change: confirm every version number and rule marked _verify_ against the current Capacitor, Apple and
Google documentation at release time.

### 4.1 Prerequisites from backend and infrastructure

- **Auth for native apps** (D5): OIDC with PKCE in the system browser (`ASWebAuthenticationSession` on iOS, Custom
  Tabs on Android), the redirect through a Universal Link or App Link, and tokens in the Keychain or Keystore through
  a secure-storage plugin. WebView cookies are not used.
- **API origin**: native apps call the API by absolute URL. Add `apiBaseUrl` to `AtlasEnvironment` and a `native`
  build configuration; the web build keeps the same-origin `/api/v1`.
- **CORS**: the backend allows exactly `capacitor://localhost` (iOS) and `https://localhost` (Android), no wildcard.
- **CSP for native**: nginx headers do not apply inside the app. Add a `<meta http-equiv="Content-Security-Policy">`
  to the native build's `index.html` with `script-src 'self'` and `connect-src` limited to the API and identity
  provider origins. `frame-ancestors` is not supported in a meta CSP, which is acceptable inside a native shell.
- **Account deletion**: the backend supports deleting the account and its data. Apple requires this inside the app
  when users can create accounts; Google Play also requires a web link for deletion requests.

### 4.2 Native projects and plugins

The generated projects `ios/` (Swift Package Manager, iOS 15.0 minimum) and `android/` (`minSdkVersion` 24,
`compileSdkVersion` and `targetSdkVersion` 36) are in git. Installed plugins: `@capacitor/app`,
`@capacitor/keyboard` and `@capacitor/splash-screen`; the status bar uses `SystemBars` from `@capacitor/core`.
`npm run assets:export` writes the native icons and splash images from the SVG masters, and
`npm run assets:validate` checks them.

1. Add the remaining plugins only when their feature lands, each checked against the licence matrix and listed in
   `THIRD-PARTY-NOTICES.md`: `@capacitor/browser` (external links and sign-in) and a secure-storage plugin (§4.1).
2. Confirm the iOS deployment target and the Android `targetSdkVersion` that Google Play requires for new apps and
   updates at release time (_verify_).
3. Android lint follow-ups before the first store build:
   - Add a monochrome layer to the adaptive launcher icon (Android 13 themed icons). This needs a monochrome master
     in `design/svg/logo/` and an export step.
   - Review the launcher icon shape warning against the adaptive icon safe zone.
   - Update the Android Gradle plugin, Gradle and AndroidX AppCompat to the versions lint suggests, then re-run
     `mobile-validation.yml`.
4. Run `npm run build && npx cap sync` after every web build. Never edit the copied web assets inside `ios/` or
   `android/`; they are git-ignored.

### 4.3 App identity and versioning

- Bundle ID and application ID `dev.myatlas.app`, registered in App Store Connect and the Play Console. The display
  name is "IKIGAI ATLAS"; check how it truncates on the home screen (the web manifest uses "Atlas" as the short name).
- One version source: `package.json` `version` sets iOS `CFBundleShortVersionString` and Android `versionName`. A
  script applies it before each native build.
- Build numbers increase with every upload: iOS `CFBundleVersion` and Android `versionCode`, derived from the CI run
  number.

### 4.4 Signing and secrets

- iOS: a distribution certificate and an App Store provisioning profile, or automatic signing with an App Store
  Connect API key in CI.
- Android: an upload keystore with Play App Signing enabled. Back up the upload key outside the repository.
- All signing material lives in GitHub Actions secrets or the organisation's secret store. Add `*.jks`, `*.keystore`,
  `*.p12`, `*.mobileprovision` and `*.p8` to `.gitignore`.

### 4.5 Build pipeline

Add a native workflow (manual, or on release tags) next to `frontend-ci.yml`:

1. `npm ci`, `npm run verify`, the production build with the `native` configuration, then `npx cap sync`.
2. iOS on a macOS runner: archive and export with `xcodebuild` (or fastlane), then upload to TestFlight.
3. Android: `./gradlew bundleRelease` produces the AAB that Google Play requires; upload it to the internal testing
   track.
4. Attach the SBOM and build logs to the release, and record the build numbers in the release notes.

### 4.6 Native behaviour

Apple can reject an app that is only a wrapped website (App Review Guideline 4.2), so these items are required, not
cosmetic.

Items marked done are implemented in `capacitor.config.ts` and `core/native/` and covered by unit tests; safe areas,
splash and status bar were also checked on the iOS simulator. Each still needs the real-device pass in [accessibility-evidence.md §3](accessibility-evidence.md#3-real-devices).

- [x] Safe areas: the shell and bottom navigation use `--safe-area-*` (Capacitor's `--safe-area-inset-*`, then
      `env(safe-area-inset-*)`); nothing sits under the notch, the Dynamic Island or the home indicator.
      `viewport-fit=cover` is set in `src/index.html`.
- [x] The status bar style follows the active theme.
- [x] The splash screen hides after the first navigation renders; the 3 s auto-hide is only a fallback.
- [x] Keyboard: the layout resizes and the focused field scrolls into view.
- [ ] Keyboard: the bottom navigation hides while typing.
- [x] Android back button: closes an open dialog or menu, else navigates back; at the root it minimises the app
      instead of looping.
- [ ] Deep links open the matching route. nginx serves `/.well-known/apple-app-site-association` and
      `/.well-known/assetlinks.json` with the `application/json` content type.
- [ ] External links (privacy policy, help) open in the in-app or system browser, never inside the app's WebView.
- [ ] Pinch zoom stays enabled for accessibility; no `user-scalable=no`.
- [ ] The theme follows the system setting by default; the stored choice overrides it.
- [ ] Offline at start-up shows the Error state with Retry, not a white screen.
- [ ] The app resumes correctly from the background and refreshes stale data (`@capacitor/app` `resume` event).
- [ ] Motion respects "Reduce Motion" on both platforms.

### 4.7 Privacy and compliance

- [ ] The App Store privacy details and the Google Play Data safety form match what the app and backend actually
      collect.
- [ ] iOS privacy manifest (`PrivacyInfo.xcprivacy`) declares the required-reason APIs used by the app and its
      plugins, for example `UserDefaults` used by preference storage.
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption` is `NO` if the app uses only standard HTTPS (_verify_).
- [ ] No tracking: no tracking SDK is included, so no App Tracking Transparency prompt is needed.
- [ ] If sign-in offers a third-party social login, Sign in with Apple or an equivalent privacy-focused option is
      offered as well (Guideline 4.8, _verify_).
- [ ] The App Store age rating and the Google Play content rating questionnaire are completed.
- [ ] The privacy policy URL, support URL and account-deletion URL are set in both consoles.

### 4.8 Store listing assets

| Asset                                                          | Source                                           | Status                          |
| -------------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| App Store icon 1024 × 1024, no alpha                           | `design/exports/app-icon/ios-app-store-1024.png` | exists                          |
| Google Play icon 512 × 512                                     | `design/exports/app-icon/google-play-512.png`    | exists                          |
| Google Play feature graphic 1024 × 500                         | brand masters in `design/svg/`                   | **to create**                   |
| iPhone screenshots (required sizes, _verify_), iPad if offered | release build, both themes                       | **to create**                   |
| Android phone screenshots, tablet if offered                   | release build, both themes                       | **to create**                   |
| Name, subtitle, description, keywords, release notes           | product copy in the UI vocabulary                | **to write**                    |
| Demo account for App Review                                    | a seeded account on the production backend       | **to create** before submission |

Screenshots show real, neutral content: no development sample plan and no invented financial values.

### 4.9 Testing before submission

- [ ] TestFlight (internal, then external testers) and the Google Play internal and closed testing tracks.
- [ ] New personal Google Play developer accounts must run a closed test with a minimum number of testers for a
      minimum period before production access (_verify_ the current rule and plan the time).
- [ ] Device matrix: a current and an older iPhone, an iPad if supported, a recent Pixel and a low-end Android
      phone. Both themes, the largest text size, VoiceOver and TalkBack.
- [ ] Sign-in, sign-out, session expiry, deep links, offline start, backgrounding, and an upgrade from the previous
      build that keeps the user signed in.

### 4.10 Release and rollback

- [ ] Use the App Store phased release and a Google Play staged rollout (for example 5 % → 20 % → 100 %).
- [ ] Decide on a minimum supported app version. The backend returns a clear error for unsupported versions, and the
      app shows an "Update required" screen that links to the store.
- [ ] A store build cannot be rolled back: halt the rollout and ship a fixed build with a higher build number. The
      backend stays compatible with the previous app version for at least one release cycle.
- [ ] The web image and the store builds are released from the same Git tag, so all three run the same frontend
      version.

### 4.11 Release order

1. Backend, infrastructure and auth are live in production (`atlas-microservices`, `atlas-infra`).
2. Section 2 (mock cleanup) and section 3 (documentation) are merged.
3. Section 1 is complete for the web, and the web image is deployed to production.
4. §4.1–4.7 are complete, and TestFlight and the Play closed test run without blocking issues (§4.9).
5. The store listings (§4.8) are complete, and the builds are submitted for review.
6. After approval: phased release and staged rollout (§4.10). Watch error reports and store reviews before reaching
   100 %.
