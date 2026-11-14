# Implementation roadmap — Figma V3 to production

- Status: approved by the owner on 2026-11-14 with the decisions in §4. Phase 1 is in progress.
- Purpose: turn the approved Figma V3 design into the production Angular app, in small reviewed PRs.
- Maps the nine implementation phases of the production brief onto the existing backlog in
  [PLAN-FRONTEND.md](../plan/PLAN-FRONTEND.md) (`F…` IDs) and the cross-repository phases in
  [IMPLEMENTATION-ROADMAP.md](../plan/IMPLEMENTATION-ROADMAP.md) (P0–P11). Those documents stay authoritative for
  backend and infrastructure dependencies; this one sets the frontend order.
- Related: [frontend.md](../architecture/frontend.md), [figma-handoff.md](../design/figma-handoff.md),
  [component-mapping.md](../design/component-mapping.md), [design-tokens.md](../design/design-tokens.md)

## 1. Working rules

- **One backlog item per PR**, small and reviewable (aim < 400 changed lines excluding generated files). Each PR names
  its backlog ID and the Figma node IDs it implements.
- Every PR runs `npm run verify` and `npm run e2e` green. UI PRs add a `/_design` section or a page route, component
  tests, and axe-clean Playwright coverage at 390 / 768 / 1440 in dark and light.
- Each PR description includes a Figma-vs-build screenshot comparison for the touched states.
- A phase starts only after the owner approves the previous phase gate (§3). Phases may overlap only where marked.
- Frontend and backend stay in separate repositories. Contract changes go through the backend's OpenAPI snapshot.
- No mock data in components; no invented finance or AI output; Figma visuals are kept unless accessibility requires a
  change, which is then raised with the designer.

## 2. Phases

New IDs introduced here (approved 2026-11-14): `T-*` tokens and assets, `P-V*` visualisation, `P-D*` Life Dimensions, `P-C*` companion,
`P-N*` native. They are added to PLAN-FRONTEND once this roadmap is approved.

### Phase 1 — Setup and alignment (repo P1 finish)

| ID      | Item                                                                                                                                                                     | Status                                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1-1…13 | Scaffold, tokens pipeline, brand assets, theme, icons, CI, container, docs                                                                                               | done                                                                                                                                                                                                              |
| F1-15   | First push, green CI on GitHub, branch protection                                                                                                                        | **owner action**: the remote `hsnrzv/atlas` is empty and needs the owner's account (push, settings)                                                                                                               |
| S-1     | Record the decisions in §4; accept ADR-0009 (Signal Forms) and ADR-0010 (Figma visual source, design time only)                                                          | done 2026-11-14                                                                                                                                                                                                   |
| S-2     | `src/environments` (`dataSource`, `devTools`, `companionArt`) with `fileReplacements`; ESLint import boundaries ([frontend.md §3](../architecture/frontend.md#3-layers)) | done 2026-11-14: typed `ATLAS_ENVIRONMENT` token; the flags separate `ng serve` from the production build only, so all deployed environments share one image (D4). Angular Testing Library stays with F2-1a (D12) |

**Gate 1:** decisions approved (done); CI green on GitHub (waits for F1-15).

### Phase 2 — Tokens, typography, icons and assets

| ID  | Item                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-1 | Quiet Tide colour tokens (both themes), new semantic roles, contrast pairs, Material palette regenerated from jade, `design-foundation` updated ([design-tokens.md §8](../design/design-tokens.md#8-implementation-order)) |
| T-2 | Manrope replaces DM Serif Display; `font.heading`, `bold`, `control`, `wordmark` styles; notices and licence matrix                                                                                                        |
| T-3 | Icon stroke 2 and registry glyph changes ([component-mapping.md §2](../design/component-mapping.md#2-icons)); ADR-0005 amendment                                                                                           |
| T-4 | Withdrawn (R-2): no Figma snapshots, mapping file or diff script; Figma-to-code stays a reviewed development-time activity                                                                                                 |
| T-5 | Brand assets from Figma pages 01/15: four-circle symbol masters, lockups, app icons (dark/light), favicon/PWA/Capacitor exports; `AtlasLogo` update                                                                        |

**Gate 2:** `/_design` matches Figma page 02 foundations in both themes; contrast gate green.

### Phase 3 — Shared UI and the application shell

| ID    | Item                                                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1-14 | Shell: `AtlasAppShell`, sidebar/rail, nav item, topbar, bottom nav (80 px), More sheet, placeholder pages for all areas, skip link, titles, `/_design` move, theme preference (D1, R-5); no top-bar Search/Quick add yet (R-14) |
| F2-1a | Badges and progress: `StatusBadge`, `DimensionBadge`, `Progress`, `DateLabel`                                                                                                                                                   |
| F2-1b | Page scaffolding: `PageHeader`, `Breadcrumbs`, `FeedbackState`, `Skeleton`                                                                                                                                                      |
| F2-1c | Controls: Material button/icon-button overrides, `SearchField`, tabs, filter chips, tooltip, popover                                                                                                                            |

**Gate 3:** shell matches Figma page 04 at all three widths and both themes; keyboard and axe pass; no horizontal overflow.

### Phase 4 — My Atlas with mock data

| ID    | Item                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| F2-2  | Models, `statusForNode` (D14), ports, `MockGoalRepository` with the single §10.5 sample and fixture progress (R-6), bundle guard |
| F2-3a | My Atlas cards: `Hero`, `NextWaypoint`, `GlanceSummary`, `DestinationCard`                                                       |
| F2-3b | My Atlas page: Overview, Empty, Loading, Error states (Figma page 05), mobile More sheet wired                                   |

**Gate 4:** My Atlas matches page 05 in all states; the production bundle contains no mock (guard green).

### Phase 5 — Destinations, Waypoints and Steps

| ID   | Item                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| F2-4 | Destinations overview with filters                                                                             |
| F2-5 | Destination detail, tabs, `WaypointRoute`                                                                      |
| F2-6 | Waypoints overview and detail; drill-down to any depth; Blocked availability with reason                       |
| F2-7 | Steps overview, `StepRow`, Step detail (side sheet), Blocked Step; status change through the port; live region |
| F3-0 | Signal Forms + Material spike (frontend.md §8)                                                                 |
| F3-1 | Destination create/edit/archive/delete: form dialog/sheet, confirmation dialog, Saved toast                    |
| F3-2 | Nested Waypoint/Step create/edit/reorder/delete; dependency picker                                             |
| F3-3 | Notes (plain text, D13) and dates with precision                                                               |

F3-* items may start after F2-5 in parallel with F2-6/F2-7. Figma flows B, C and D become Playwright journeys here.

**Gate 5:** flows B–D pass e2e at all widths and both themes; repo phase-2 gate met (overview → Destination → Waypoint
→ nested → back, Chromium/Firefox/WebKit, zero axe violations).

### Phase 6 — Connections, Journey, Awards, Life Dimensions, onboarding and companion

| ID   | Item                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-V1 | Visualisation spike (R-7, ADR-0004), then Connections: graph and list, selected relationship, legend, zoom controls; finance "Illustrative · unverified" |
| F2-9 | Journey v0: accessible chronological list (repo backlog)                                                                                                 |
| P-V2 | Journey timeline: ranges, Today marker, approximate dates, "Not placed yet"                                                                              |
| F2-8 | Awards: planned / earned / redeemed; celebration (respects companion preference)                                                                         |
| P-D1 | Life Dimensions overview (7 cards, "Add intention") and dimension detail                                                                                 |
| F3-4 | Welcome and onboarding (skippable); dev-only "Explore sample plan"                                                                                       |
| P-C1 | Companion preferences (on/muted/off), static copy, placeholder art behind the `companionArt` flag                                                        |

Figma flows A, E, F, G and H become Playwright journeys.

**Gate 6:** all eight Figma areas and flows A–H implemented on mock data and matching Figma.

### Phase 7 — Responsive, accessibility, themes and Capacitor

| ID    | Item                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| F2-10 | Cross-browser e2e (Firefox, WebKit), responsive smoke at 390/768/1440                                                     |
| A-1   | Accessibility pass: screen-reader checks (VoiceOver, TalkBack, NVDA), forced colours, reduced motion, 200 % zoom/reflow   |
| A-2   | Visual regression of `/_design` and key pages in both themes (proposal)                                                   |
| P-N1  | Capacitor iOS/Android projects, status bar, splash, keyboard, back button, safe areas (pulled forward from repo P10, R-8) |
| P-N2  | Device testing per the page-13 mobile contract; Lighthouse budgets in CI                                                  |

**Gate 7:** WCAG 2.2 AA evidence for every page; app runs on one real iOS and one Android device.

### Phase 8 — Typed API contracts

| ID   | Item                                                                                  |
| ---- | ------------------------------------------------------------------------------------- |
| F3-5 | OpenAPI types from the backend snapshot (D3, types only); CI fails on drift           |
| F4-1 | `HttpGoalRepository` and the other HTTP adapters; switch by environment               |
| F4-2 | HTTP layer: base path, Problem Details, retries, money from string amounts via `Intl` |

Depends on backend phase 3 (OpenAPI snapshot, BE-3.82). F3-5 can start as soon as the snapshot exists.

**Gate 8:** every port has an HTTP adapter that passes the same store tests as the mock.

### Phase 9 — Production integration, testing and deployment

| ID    | Item                                                                 |
| ----- | -------------------------------------------------------------------- |
| F4-3  | Loading/empty/error/retry everywhere, ETag/If-Match, Idempotency-Key |
| F4-4  | All features wired to the backend                                    |
| F4-5  | Auth-ready client (cookies, XSRF, 401 hook, `/me`)                   |
| F4-6  | E2E against the local full stack in CI                               |
| F4-7  | Mock adapter removed from non-development builds; bundle check       |
| F2-11 | Supply-chain gates (licence allow-list, SBOM, image scan)            |
| F2-12 | GHCR publishing and `atlas-infra` bump PRs                           |

**Gate 9:** repo phase-4 gate (no demo-only data against the real backend; staging e2e green). Store release stays
in repo phase 10 after identity hardening (phase 9 of the repo plan).

## 3. Mapping summary

| Brief phase | Content                                     | Repo phase (IMPLEMENTATION-ROADMAP) | Backlog                                  |
| ----------- | ------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| 1           | Setup                                       | P1                                  | F1-1…F1-15, S-1, S-2                     |
| 2           | Tokens, typography, icons, assets           | P1/P2 (new)                         | T-1…T-5                                  |
| 3           | Shared UI + shell                           | P1 (F1-14), P2                      | F1-14, F2-1                              |
| 4           | My Atlas on mock data                       | P2                                  | F2-2, F2-3                               |
| 5           | Destinations / Waypoints / Steps            | P2, P3 (frontend on mock)           | F2-4…F2-7, F3-0…F3-3                     |
| 6           | Connections / Journey / Awards / Dimensions | P2, P3, P5 (visualisation)          | P-V1, P-V2, F2-8, F2-9, P-D1, F3-4, P-C1 |
| 7           | Responsive, a11y, themes, Capacitor         | P2 (F2-10), P10 (native)            | F2-10, A-1, A-2, P-N1, P-N2              |
| 8           | Typed API contracts                         | P3/P4                               | F3-5, F4-1, F4-2                         |
| 9           | Production integration, test, deploy        | P4, P9                              | F4-3…F4-7, F2-11, F2-12                  |

## 4. Decisions (final, 2026-11-14)

The owner decided R-1…R-4, R-12 and R-13 directly, and asked for R-5…R-11 and R-14 to be checked against the settled
requirements (`project-instruction.md`, ADRs, PLAN-FRONTEND decisions). A default is kept only where it does not
reopen a settled requirement; where a concrete conflict exists, the settled requirement wins or the trade-off is listed
in §4.1.

| ID   | Topic                               | Decision                                                                                                                                                                                                                                                                                                | Affects     |
| ---- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| R-1  | Forms                               | **Accepted:** Signal Forms ([ADR-0009](../adr/0009-signal-forms.md)).                                                                                                                                                                                                                                   | F3-0, F3-1  |
| R-2  | Figma as visual source              | **Accepted as revised:** Figma is the visual source at design time only; no Figma API, token, snapshot, diff script or CI step; JSON tokens remain an internal artefact ([ADR-0010](../adr/0010-figma-visual-source-of-truth.md)). T-4 withdrawn.                                                       | T-1…T-4     |
| R-3  | Typography                          | **Follow Figma V3:** Manrope (headings, wordmark) and Inter, the `Atlas/V3/*` text styles ([design-tokens.md §5.1](../design/design-tokens.md#51-typography)).                                                                                                                                          | T-2         |
| R-4  | Icons                               | **Follow Figma V3:** Tabler, 24 px, stroke 2; glyphs match `Atlas/V3/Icon` (`152:2139`), each checked against the Figma glyph in T-3.                                                                                                                                                                   | T-3         |
| R-5  | Theme default                       | **D1 stands unchanged:** follow `prefers-color-scheme` until the user picks light or dark; store only that choice. The proposed "dark when unknown" refinement is dropped: browsers always resolve the media query to light or dark, so it changed nothing.                                             | F1-14       |
| R-6  | Progress in the mock                | **Revised (follows R-12):** the mock contains no progress rule. It serves backend-shaped, precomputed values transcribed from Figma (20 %, 40 %, and the after-states of flows D and G, e.g. 3/5 → 60 %). An unscripted change leaves derived values as they are. No progress code in the frontend.     | F2-2        |
| R-7  | Graph and timeline technology       | **Spec default stands:** `project-instruction.md` §9 selects ECharts (+ ngx-echarts) and vis-timeline, with D3 only as a fallback. The earlier native-SVG proposal reopened that without a proven conflict. Open trade-off T-A (§4.1), decided by a spike at the start of P-V1.                         | P-V1, P-V2  |
| R-8  | Capacitor native projects           | **Accepted:** the brief puts Capacitor in phase 7; projects and device testing in phase 7, store release stays in repo phase 10. No conflict with the spec.                                                                                                                                             | P-N1        |
| R-9  | Companion art                       | **Accepted:** placeholder (Atlas symbol) behind `companionArt`, off by default; real art after the owner confirms the rights. Not an architectural trade-off.                                                                                                                                           | P-C1        |
| R-10 | Bottom navigation height            | **Settled by R-2:** 80 px is a Figma layout value.                                                                                                                                                                                                                                                      | F1-14       |
| R-11 | "Achieved" vs "Completed"           | **Settled by ADR-0006 and R-2:** labels are vocabulary, owned by ADR-0006 ("Completed"), not by Figma. Figma is inconsistent (badges say "Achieved", the Waypoint legend says "Completed"). The UI uses "Completed"; the mismatch is reported to the designer. Changing it needs an ADR-0006 amendment. | F2-1a       |
| R-12 | Backend-owned domain rules          | **Pending the backend:** `project-instruction.md` §21 #6 (skipped and partially completed work in progress) and #7 (date precision model), the at-risk flag (D14) and availability. The frontend displays backend values only and invents none.                                                         | F2-2, F3-3  |
| R-13 | Light control border and nav accent | **Verified in Figma** (`get_variable_defs`): `v3/border/control` light `#798B88` (3.12–3.58:1, passes 3:1); the light active nav item binds only `v3/state/success/background` with text/primary, no accent.                                                                                            | T-1         |
| R-14 | Search and Quick add in the top bar | **Revised:** do not render controls without behaviour. Quick add appears with the create flows (F3-1/F3-2); global search waits for trade-off T-B (§4.1). Rendering disabled buttons with tooltips was dropped: disabled buttons are not focusable, so the tooltip is not keyboard-reachable.           | F1-14, F3-1 |

### 4.1 Open trade-offs

Neither blocks phase 1 or the next phase.

| ID  | Trade-off                                                                                                                                                                                                                                                                                                                                                                                                | Proposed resolution                                                                                                                                                                                                                                             | Needed by |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| T-A | **Graph and timeline (R-7).** The spec libraries bring zoom, pan and layout, but render to canvas or their own DOM, so matching the Figma `GraphNode`/`GraphConnector`/`TimelineMarker` styles and giving every node keyboard focus is harder, and they add bundle weight. Native SVG matches Figma exactly with no dependency, but zoom/pan, layout and keyboard handling must be built and maintained. | Time-boxed spike (1–2 days) at the start of P-V1 that builds the Figma Connections and Journey frames both ways and measures fidelity, keyboard/screen-reader access and bundle size. ADR-0004 records the result. The list alternative is required either way. | P-V1      |
| T-B | **Global search (R-14).** No behaviour is specified for the top-bar search and the backend has no search endpoint. Client-side search over the loaded Destinations is cheap but incomplete; a backend search is complete but needs a backend decision.                                                                                                                                                   | Leave global search out of F1-14; Destinations list search/filter (F2-4) covers the specified "searchable goal list". Decide global search together with the backend when a search use case is written.                                                         | F2-4      |

## 5. Risks

| Risk                                              | Mitigation                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Material M3 components do not match Figma closely | restyle with system variables and tokens; wrapper only where needed; compare in `/_design`          |
| Signal Forms integration with `mat-form-field`    | F3-0 spike before F3-1; fallback directive                                                          |
| Figma changes during implementation               | design freeze per phase gate; node IDs recorded per component; Figma-vs-build screenshots in review |
| Mock and backend drift                            | models follow API-CONTRACT; F3-5 snapshot diff; same store tests for both adapters                  |
| Accessibility gaps in custom SVG visualisations   | list alternatives, keyboard model designed before visuals, screen-reader checks at gate 6           |
| Font and asset weight                             | variable fonts, Latin subset, budgets in CI                                                         |
