# Figma handoff — IKIGAI ATLAS V3 ("Quiet Tide")

- Status: inspected 2026-11-14, approved 2026-11-14 (Figma is design-time context only, ADR-0010)
- Figma file: `zlFVZJ57AYBHUBhoIsT030`, reference node `141:591` ("Reference · V3 approved refinement")
- Related: [component-mapping.md](component-mapping.md), [design-tokens.md](design-tokens.md),
  [../architecture/frontend.md](../architecture/frontend.md), [../implementation/roadmap.md](../implementation/roadmap.md)

This document says which Figma frames are canonical, what each page contains, and how to read the file from code. The
Figma file is the **source of truth for visual styling**: colours, typography, spacing, component anatomy, states and
layout. `project-instruction.md` stays the source of truth for domain behaviour, the API and architecture. When Figma
and `design-instructions.md` disagree on visuals, Figma wins and `design-instructions.md` is corrected (see its
§0.1 precedence note).

## 1. Precedence and canonical sources

| Question                                    | Source                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Colour, type, spacing, radius, icon stroke  | Figma variables (page 02) → `design/tokens/*.json` ([design-tokens.md](design-tokens.md)) |
| Component anatomy, variants, states         | Figma page 03 Components (`Atlas/V3/*` component sets)                                    |
| Shell and navigation                        | Figma page 04 App Shell                                                                   |
| Page layout per area and viewport           | Figma pages 05–12 (canonical area frames)                                                 |
| Interaction flows                           | Figma page 14 Prototypes (static sample states only)                                      |
| Logo, symbol, app icon                      | Figma pages 01 Brand and 15 Export Assets; SVG masters in `design/svg/`                   |
| Domain rules, progress policy, API, routing | `project-instruction.md`, ADRs                                                            |
| Copy (labels, empty-state text)             | Figma frames, checked against ADR-0006 vocabulary                                         |

**Not canonical:**

- Page 13 Mobile Applications is a gallery of reference snapshots ("Gallery reference. Edit canonical area frames on
  pages 05–12."). Use the 390 × 844 frames on pages 05–12 instead.
- Archive pages and anything outside the `Atlas/V3` namespace. Earlier designs are kept there only for history.
- The logical route keys on page 00 (`atlas.overview`, `destinations.list`, …) are explicitly "not verified code
  URLs". Real routes are defined in [frontend.md §5](../architecture/frontend.md#5-routing).
- Numbers in static demos. 3/5 = 60 %, 3/10 = 30 % and 5/10 = 50 % are illustrative frames, not tested calculations.
  Progress always comes from the backend or the mock adapter (§6).

## 2. Page index

| Page               | Node       | Content                                                                                           |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------- |
| 00 Start here      | `152:2099` | Status (48/48 main layouts, 94 supporting views), route keys, sample progress policy, open items  |
| 01 Brand           | `214:1719` | Four-circle symbol (Dark/Light × Color/Mono), horizontal and stacked lockups, companion register  |
| 02 Foundations     | `214:1720` | Primitive + semantic colour tables, signature edge, typography, component usage and accessibility |
| 03 Components      | `152:2100` | `Atlas/V3/*` component sets (catalogue in [component-mapping.md](component-mapping.md))           |
| 04 App Shell       | `214:1721` | Sidebar, rail, top bar, bottom navigation, nav item, light shell presentations                    |
| 05 My Atlas        | `214:1722` | Overview, Empty, Loading, Error, mobile "More" sheet                                              |
| 06 Destinations    | `214:1723` | Overview, Detail, Goal management dialog (CreateEmpty, CreateFilled, Edit), Saved toast           |
| 07 Waypoints       | `214:1724` | Overview (route list + legend + side cards), Detail                                               |
| 08 Steps           | `214:1725` | Overview (filters + parent panel), Step detail, Updated scenario, Blocked Step detail             |
| 09 Connections     | `214:1726` | Graph, Selected relationship, List                                                                |
| 10 Journey         | `214:1727` | Timeline with ranges, filter, Today marker, legend, "Not placed yet" list                         |
| 11 Awards          | `214:1728` | Overview, Completion study, Celebration study                                                     |
| 12 Life Dimensions | `214:1729` | Overview (7 cards + "Add intention"), Career detail                                               |
| 13 Mobile          | `214:1730` | Gallery only (not canonical) + mobile/WebView contract                                            |
| 14 Prototypes      | `214:1731` | 179 frames, 1 130 ON_CLICK interactions, flow index `230:73933`                                   |
| 15 Export Assets   | `214:1732` | Symbol, lockup and app-icon exports, production checklist                                         |

### 2.1 Viewports and themes

Every area on pages 05–12 exists as **Desktop 1440 × 1024**, **Tablet 768 × 1024** and **Mobile 390 × 844**, each in
**Dark** and **Light**. Modal frames are 560 × 820 (desktop/tablet) and 390 × 740 (mobile). Dark is the primary
presentation in the file. Light is a complete, equal theme.

### 2.2 Key frames

Use these node IDs with `get_screenshot` / `get_metadata` when building each screen.

| Area / state                              | Node                                    |
| ----------------------------------------- | --------------------------------------- |
| Foundations · semantic colour table       | `214:1925`                              |
| Foundations · signature edge + typography | `214:2158`                              |
| Foundations · usage and accessibility     | `214:2182`                              |
| Components · cards and summaries          | `152:2130`                              |
| Components · icon set                     | `152:2139`                              |
| Shell · sidebar, My Atlas active          | `152:2865`                              |
| My Atlas · desktop dark / mobile light    | `214:2602` / `214:2738`                 |
| Destinations · overview / detail          | `230:7954` / `230:8394`                 |
| Destinations · create form (light)        | `230:25490`                             |
| Waypoints · overview / detail             | `230:18296` / `230:18894`               |
| Steps · overview / blocked step detail    | `230:14111` / `230:34544`               |
| Connections · graph / selected relation   | `230:21653` / `230:22691`               |
| Journey · overview                        | `230:32816`                             |
| Awards · overview / celebration           | `230:28039` / `230:30459`               |
| Life Dimensions · overview / Career       | `230:26744` / `230:31837`               |
| Getting started · welcome / onboarding    | `230:63370` / `230:63378`               |
| Companion · preferences / muted / off     | `230:74295` / `230:74299` / `230:74303` |
| Prototype flow index                      | `230:73933`                             |
| Export · production checklist             | `369:105`                               |

## 3. Areas and states to implement

Each area needs the states shown in Figma. Areas without explicit loading/empty/error frames reuse the
`FeedbackState` component (Empty, Loading, Error, Success) shown on My Atlas.

| Area             | States in Figma                                             | Notes for implementation                                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| My Atlas         | Overview, Empty, Loading, Error, mobile More page           | Hero "Build the life you envision." + destination metric, Next Waypoint focus card, At a glance, DestinationCard, companion card. Empty is the default after onboarding "Continue"/"Skip".                             |
| Destinations     | Overview, Detail, Create (empty/filled), Edit, Saved toast  | Form fields: Name (required), Outcome, Dimension, Status, Target, Application date, Why it matters, Reward. "Use sample details" is a prototype affordance only and does not ship (§6).                                |
| Waypoints        | Overview, Detail                                            | Route list with legend Completed / Active / Upcoming / Blocked. Side cards: "Next focus", "Dates keep their precision", "Availability is not status". Detail: target outcome, Open Steps, timing, notes.               |
| Steps            | Overview, Detail, Updated scenario, Blocked detail          | Filters Status / Due / Priority, parent Waypoint panel. Blocked: "Availability: Blocked · prerequisite incomplete", View prerequisite, Mark complete disabled.                                                         |
| Connections      | Graph, Selected relationship, List                          | Graph/List toggle, filters, Zoom + / − / Focus / Reset, legend: Association solid, Possible impact dashed. Details say "Illustrative · unverified" and show no amounts.                                                |
| Journey Overview | Overview                                                    | Ranges 3m / 6m / 1y / 3y / All, dimension filter, Today marker, rows Application / Programme start / Graduation, legend Planned solid / Unplaced hollow / Approximate dashed, "Not placed yet" list for undated nodes. |
| Milestone Awards | Overview, Completion study, Celebration study               | "0 earned · 1 planned". Celebration uses the companion raster, Dismiss / Mute / Disable, "No points". Completion study is illustrative: "Not a sample achievement".                                                    |
| Life Dimensions  | Overview, Career detail                                     | Seven DimensionCards plus "Add intention". Copy: "Progress follows your Destinations, not your worth." No aggregate life score.                                                                                        |
| Getting started  | Welcome, Onboarding (prototype page 14 only)                | "A little direction. Your pace." Area chips, intention "Add later", Companion preferences, Continue / Skip for now / Explore sample plan. Maps to F3-4.                                                                |
| Companion        | Preferences, Muted preview, Disabled preview (page 14 only) | "Your companion, your choice": Dismiss / Mute / Disable. Optional, no audio, no AI analysis, no streaks.                                                                                                               |

## 4. Prototype flows (page 14)

The flow index (`230:73933`) defines eight paths, each in Desktop/Mobile × Dark/Light, plus tablet entry points per
area. They are the source for the Playwright journeys in [roadmap.md](../implementation/roadmap.md).

| Flow | Name                           | Path                                                                          |
| ---- | ------------------------------ | ----------------------------------------------------------------------------- |
| A    | Welcome & optional setup       | Continue / Skip → empty Atlas; Explore sample → seeded plan                   |
| B    | Destination → Waypoint → Steps | Active application, draft personal statement                                  |
| C    | Create & edit destination      | Add → blank → sample details → saved example (no data saved in the prototype) |
| D    | Step completion preview        | Mark complete → 3/5 = 60 % application; 3/10 = 30 % goal                      |
| E    | Journey & selected milestone   | Application marker → active Waypoint; other dates stay unspecified            |
| F    | Connections & relationship     | Finance node → possible cost relationship; no financial figures               |
| G    | Milestone completion preview   | 5/5 = 100 %; goal 5/10 = 50 %; Graduation still planned                       |
| H    | Responsive navigation          | Career → active destination; no aggregate life score                          |

Prototype frames are static. Search, filters, sorting, timeline ranges, graph zoom/pan and unspecified destinations
are unwired in Figma, and forms, progress, save and companion preferences are previews only. Their behaviour comes
from `project-instruction.md`, not from the prototype.

## 5. Brand, companion and export assets

- **Symbol:** four overlapping circles with a shared centre (top `#5685B5`, left `#348F84`, right `#8A73BB`, bottom
  `#B17D9E`). Variants Theme Dark/Light × Color/Mono (`152:2281`–`152:2296`). Minimum proofs at 24, 32, 48 and 64 px.
  The four circles are the Ikigai circles and are distinct from the seven Life Dimensions. The repo masters in
  `design/svg/logo/` (commit `5e9e546`, cardinal Venn) must be compared with the Figma export in roadmap phase 2.
- **Lockups:** horizontal 232 × 48 and stacked 172 × 138, dark and light. Wordmark "IKIGAI ATLAS" as editable text.
- **App icon:** dark and light 256 × 256 masters exported at 4× → 1 024 × 1 024. Square, opaque background, centred
  artwork, no text. Store masks are applied in the native build.
- **Companion:** a spherical character with expressions Welcome, Encouraging, Celebrating, Surprised, Thinking,
  Guiding, Supportive and Idle. It is **raster PNG demonstration art, not vector**. Pending: Thinking/Guiding gaze,
  sleepy Idle, celebration cleanup, transparent production exports and commercial-rights clearance. Rules: never label
  the bitmap as editable SVG; always offer Dismiss / Mute / Disable; no false AI analysis and no streaks. Until the
  rights are cleared, the app ships a **placeholder slot** (symbol or neutral avatar) behind a feature flag; see
  [frontend.md §9](../architecture/frontend.md#9-companion).

## 6. Sample data shown in Figma

Figma uses exactly the one sample Destination required by `project-instruction.md` §10.5. The sample date is
**12 Nov 2026**.

- Destination: "Complete an online Master's degree in Computer Science / AI" (Career). Progress **20 %** = 2 of 10
  equally weighted leaves. Graduation target "End of 2030 · approx.". Reward "Graduation celebration · planned".
- Waypoint "Submit application": December 2026, month precision, **40 %** = 2 of 5 Steps.
  - Completed: Confirm programme requirements; Gather academic records.
  - In progress: Draft personal statement.
  - Not started: Review application checklist; Submit the application (availability **Blocked** by the checklist).
- Later Waypoints: Receive admission decision (date not set), Start studying (Fall 2027, approximate), Complete
  foundational coursework, Complete elective coursework, Graduate (end 2030, approximate). Thesis/capstone is optional
  and excluded until programme requirements are confirmed.
- Future Waypoints are not automatically locked. "Availability is not status": availability (open/blocked) is derived
  from dependencies; status is stored.

This data lives only in the dev-only mock adapter, never in components
([frontend.md §6](../architecture/frontend.md#6-data-access-ports-mock-and-rest-adapters)).

### 6.1 My Atlas (page 05): known deviations

Accepted with Phase 4 (F2-3b), pending owner review at gate 4:

- **Timing line:** composed from `keyDates` (FQ-6), so it reads "Start studying · 2027 · year precision" instead of
  "Fall 2027". The contract has no season precision (`PlannedDate.precision` is `DAY`/`MONTH`/`QUARTER`/`YEAR`/
  `APPROXIMATE`).
- **Recent progress:** the in-progress Step reads "Draft personal statement · In progress". The progress-policy
  caption is built from backend values ("2 of 10 Steps complete (20%) … is excluded from progress. Progress reflects
  completed Steps.").
- **Error state, last saved plan:** "40% · 2 of 5 Steps of Submit application" (Figma: "2 of 5 application Steps").
  The "Last saved plan" label is sentence case.
- **Date format:** follows `LOCALE_ID` (en-US: "November 12, 2026"; Figma: en-GB "12 November 2026") until the
  profile locale arrives (D7).
- **Not yet built:** the search, Quick add and notifications in the top bar (with their features). The companion card
  (P-C1, Phase 6) sits under the Next Waypoint card.
- "Sample plan ·" appears only while the mock serves the sample (`ATLAS_SAMPLE_DATA`); a real plan shows the date
  only.
- `FeedbackState` cards are limited to `--layout-dialog-width`.

### 6.2 Destinations, Waypoints and Steps (pages 06–08): known deviations

Accepted with Phase 5 (F2-4…F2-7, F3-0…F3-3), pending owner review at gate 5:

- **Step detail** is a full page (`/destinations/:goalId/steps/:nodeId`) on every breakpoint, not a side sheet on
  desktop. It keeps one URL per Step and one focus model.
- **Create and edit** of Destinations, Waypoints and Steps open in dialogs (full-screen on mobile) over the current
  page instead of separate routes. Destination detail is one scrolling page without tabs.
- **Steps list** is a single column. The priority filter waits for FQ-11; the Due filter is "set" / "not set". Notes
  count per Step (FQ-13) and the application date (FQ-7) are not shown.
- **Blocked Steps:** each blocked Step shows its own blocked panel with the prerequisites that block it.
- **Step order:** Steps are listed by due date, earliest first, with undated Steps last, on every page (owner
  request 2026-11-16). This replaced the move up / move down reorder on Waypoint detail.
- **Step status change** is announced through the live region with an inline message, not a toast, so the change is
  not announced twice.
- Waypoint and Step pages (`/destinations/…`) highlight "Destinations" in the navigation.
- All form fields use the outline appearance; the filled field label in the dark theme measured 4.45:1.

### 6.3 Phase 6 pages (09–14): known deviations

Accepted with Phase 6 (P-V1, F2-8, F2-9, P-V2, P-D1, F3-4, P-C1), pending owner review at gate 6:

- **Connections (09):** the caption reads "Sample plan ·" instead of the Figma date, and its copy is generalised for
  more than one Destination (the heading counts them in words). Below 768 px the List view is the default.
  - The graph lists all seven Life Dimensions, also those without a relationship (owner request 2026-11-16).
  - **Connect (owner request 2026-11-16; not in Figma):** select a Destination, then a Life Dimension it has no
    association with. On desktop a dashed line follows the mouse; below 768 px the other Destinations are disabled
    until the selection is cleared (select it again or press Escape). A "Relationship details" dialog shows the
    association and an optional contribution weight; Save adds a secondary assignment (FQ-20).
- **Journey Overview (10):**
  - Lanes use Waypoint titles; Figma's lane names (Application / Programme start / Graduation) are not in the data
    model.
  - "Fall 2027" shows as year precision (no season precision, see §6.1).
  - The dimension filter is a select, not the Figma "Career" button. The legend reads "Not placed · hollow"
    (Figma: "Unplaced").
  - The optional thesis is listed under "Not placed yet" with the excluded caption.
  - Bounded ranges run from the first day of the current month. Below 768 px the timeline becomes an agenda.
  - Range buttons and markers carry visually hidden text ("3m, Next 3 months") so their accessible name starts with
    the visible label (WCAG 2.5.3).
- **Milestone Awards (11):**
  - The planned label uses the full reward description ("Graduation celebration").
  - The prototype "Completion study" and "Celebration study" frames are not reproduced as such; the page shows the
    state the backend reports, and the celebration card appears once a Waypoint is achieved (flow G).
  - "Mark as celebrated" (redeem, API-CONTRACT §9.6) is added. Dismiss is an icon button.
  - Owner request 2026-11-16: awards are grouped per Destination, each group with its own linked Destination card, and
    a "Next Milestones" list shows the next Waypoint of every active Destination with its status, progress, Step
    count and planned date (dashboard `nextNode`, FQ-1).
  - Dates follow `LOCALE_ID` (long en-US format).
- **Life Dimensions (12–13):** Figma has copy only for Career; the other six descriptions and prompts are authored in
  `dimension-copy.ts` and need product review. "Add intention" opens the Destination form for that dimension (FQ-19).
- **Welcome and setup (14):**
  - The "Prototype" label is omitted; the art is the Atlas symbol until the companion art is cleared (R-9).
  - Production copy omits the sample sentence; "Explore sample plan" exists only in dev builds.
  - The setup heading reads "Areas · Choose any" and its description is reworded.
- **Companion:** the art slot shows the Atlas symbol (R-9). On My Atlas the card sits under the Next Waypoint card. The
  settings page has no card preview; it describes each mode in the radio option.

## 7. Reading the file from code (MCP workflow)

Inspection used the **Figma desktop MCP server** (`http://127.0.0.1:3845/mcp`) with these tools:

- `get_metadata` for structure, node IDs, names and sizes. Large pages are saved to a file and outlined.
- `get_variable_defs` for variables (colours, type, spacing, radius, sizes) in both modes.
- `get_screenshot` for visual reference of a frame or component.

`get_design_context` was **not** used. Its required `figma-design-to-code` guidance is not installed locally, and the
desktop server could not serve the guidance resource. In any case the rules forbid copying Figma's generated React
code; we only read structure, variables and screenshots and build native Angular components.

Figma recommends the **remote MCP server** for design-to-code workflows:
<https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/>. Switching to it is optional and
does not change this process.

Per component or page PR:

1. Take `get_screenshot` of the component set and the page frames (Dark + Light, all three viewports).
2. Take `get_metadata` for sizes and child order, and `get_variable_defs` for the variables bound to the node.
3. Map every value to an existing token. If a value has no token, add it to `design/tokens/*.json` first
   ([design-tokens.md §6](design-tokens.md#6-design-time-translation)); never hard-code it.
4. Build the Angular component and add it to `/_design`. Compare it with the screenshot in both themes at 390, 768
   and 1440 px.
5. Record the Figma node ID in the component's doc comment and in [component-mapping.md](component-mapping.md).

## 8. Open items from Figma page 00

These are open in the design file and must not be invented in code:

- Consolidated UI QA, keyboard and screen-reader testing, and native platform testing are pending in Figma. The app
  must pass them itself (axe, keyboard e2e, manual screen-reader checks).
- Companion production art and rights (§5).
- Mobile contract (page 13): 24 px status bar + 56 px top bar placeholders are replaced at runtime by
  `env(safe-area-inset-*)`. 44 px minimum touch targets, 48 px preferred. Resize the viewport when the keyboard opens
  and keep the focused field visible. Validate on real iOS and Android devices.
