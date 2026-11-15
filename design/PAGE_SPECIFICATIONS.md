# Page specifications

**Status: Specified.**

- Page templates are design step 6. The features themselves are later product phases.
- None of these pages exist yet. The app currently serves only the temporary design-foundation page.
- The source is design-instructions §7, with the domain model from project-instruction §3, §7 and §11.
- Routes are **proposals**. They follow ADR-0006, which says routes use the UI vocabulary.
- Visuals follow Figma V3 ([ADR-0010](../docs/adr/0010-figma-visual-source-of-truth.md)). The Figma frames and their
  component mapping are listed in [`docs/design/figma-handoff.md`](../docs/design/figma-handoff.md) and
  [`docs/design/component-mapping.md`](../docs/design/component-mapping.md).
- API paths come from the example endpoint family in project-instruction §11.5, which says "adjust names during
  planning". Rows marked _to define_ have no endpoint in that list.

## Shared rules

- **Shell:** every page sits inside `atlas-app-shell` ([RESPONSIVE_BEHAVIOR.md](RESPONSIVE_BEHAVIOR.md)). The
  wireframes are [`mockups/app-shell-desktop.svg`](mockups/app-shell-desktop.svg) and
  [`mockups/app-shell-mobile.svg`](mockups/app-shell-mobile.svg).
- **Big picture before detail:**
  - The page header and summary come first, then the next action, then the lists, then the analytics.
  - Steps are never exposed by default above the Waypoint level.
  - The Journey Overview never shows every Step.
- **Headings:** one `h1` per page, from `atlas-page-header`. Section headings follow in order.
- **Vocabulary:** UI copy uses Destination, Waypoint, Step, Connection, Milestone Award and Life Dimension. Code that
  talks to the API uses `Goal`, `GoalNode`, `GoalLink` and `GoalReward`
  ([DD-03](DESIGN_DECISIONS.md#dd-03-ui-vocabulary-maps-onto-the-domain-model)).
- **Status:** always icon + text (`atlas-status-badge`). Use no shame language and no red for ordinary delays
  (project-instruction §3.6).
- **Progress:** display the progress the backend provides. The mock adapter may use one documented, shared
  calculation. Components never compute progress themselves (§7.4).
- **Dates:** `atlas-date-label` keeps the stored precision ("Dec 2026", "Fall 2027", "Date not set").
- **Money:** financial effects are labelled _illustrative_. Never invent amounts (§7.5, §14).

### States (every page)

| State     | Pattern                                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading   | `atlas-loading-skeleton` matching the populated layout, with the region `aria-busy`. The page title renders immediately.                                             |
| Empty     | `atlas-empty-state`: one encouraging sentence and one primary action, such as "Create Destination". Filter-empty differs from data-empty and offers "Clear filters". |
| Populated | As described per page below.                                                                                                                                         |
| Error     | `atlas-error-state` in place of the failed region only, with a plain-language cause and Retry. The rest of the page stays usable.                                    |
| Disabled  | Controls are disabled only with a visible reason, such as "Locked until 'Receive admission decision' is completed". Locks never rely only on greying out.            |

### Route and data map

| Area             | Proposed route                                                     | Domain (ADR-0006)                              | API (project-instruction §11.5)                                                                       |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| My Atlas         | `/` (alias `/my-atlas`)                                            | Dashboard read model                           | `GET /api/v1/dashboard`                                                                               |
| Destinations     | `/destinations`, `/destinations/:destinationId`                    | `Goal`                                         | `GET/POST /api/v1/goals`, `GET/PATCH/DELETE /api/v1/goals/{goalId}`                                   |
| Waypoints        | `/waypoints`, `/destinations/:destinationId/waypoints/:waypointId` | `GoalNode` (`MILESTONE`, `CHECKPOINT`)         | `GET/PATCH /api/v1/goals/{goalId}/nodes/{nodeId}`, `…/tree`. A cross-Destination list is _to define_. |
| Steps            | `/steps`, `/destinations/:destinationId/steps/:stepId`             | `GoalNode` (`TASK`)                            | `…/nodes/{nodeId}`, `…/complete`, `…/reopen`. A cross-Destination list is _to define_.                |
| Connections      | `/connections`, `/connections/:connectionId`                       | `GoalLink` and `GoalNodeDependency`            | _to define_                                                                                           |
| Journey Overview | `/journey`                                                         | Timeline read model                            | _to define_                                                                                           |
| Milestone Awards | `/awards`, `/awards/:awardId`                                      | `GoalReward` (`PLANNED`, `EARNED`, `REDEEMED`) | _to define_                                                                                           |
| Life Dimensions  | `/dimensions`, `/dimensions/:dimensionKey` (lowercase key)         | Ikigai area (`CAREER` … `FAMILY`)              | `GET /api/v1/ikigai/areas`                                                                            |

Nested Waypoints, which the domain allows at any depth, reuse the Waypoint route with their own id. Their breadcrumb is
built from `…/tree`.

## 1. My Atlas (§7.1)

**Purpose:** an immediate, motivating overview without overwhelming detail.

**Content hierarchy:**

1. A greeting and the headline "Build the life you envision."
2. A date and context line.
3. The **next Waypoint** hero: a `--color-surface-hero` card with a subtle route motif and the signature edge gradient
   (`--gradient-signature-edge`) on its upper edge. Its primary action is "Explore next waypoint".
4. A journey summary: active Destinations, Waypoints completed and upcoming deadlines. Use three `atlas-metric-card`s at
   most, not a wall of KPIs.
5. Seven Life Dimension cards in canonical order. Each has a card surface, a dimension-coloured icon, a slim progress
   bar and a text status, such as "No Destinations yet".
6. Next Waypoints: 3–5 items.
7. Recent Progress feed.
8. Needs Attention, optional. Only for overdue or blocked items, with neutral wording.
9. A Quick Capture action in the top bar.

| Breakpoint      | Layout                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop ≥ 1024  | Hero (2/3) + summary (1/3). Dimension grid with 4 + 3 or 7 columns at `xl`. Next Waypoints and Recent Progress side by side. See the desktop wireframe.                                                                                                |
| Tablet 768–1023 | Hero full width with the summary below. Dimension grid in 2–3 columns. Lists stacked.                                                                                                                                                                  |
| Mobile < 768    | Hero, then the summary strip, then a horizontal dimension carousel (with scroll snap and visible next-card affordance), then Next Waypoints, then Recent Progress. Quick add sits in the top bar so it never covers content. See the mobile wireframe. |

**Actions:** view a dimension, open a Destination, complete a Step, add a note, create a Destination, open the Journey
Overview.

**Empty (first run):** the hero becomes "Set your first Destination", and the dimension cards stay visible as an
invitation.

**Accessibility:**

- The carousel is a plain list with horizontal scroll and is keyboard reachable. It has no auto-advance.
- Metrics carry their units in text.

## 2. Destinations (§7.2)

**List:**

- A header with a one-sentence explanation.
- `atlas-search-field`, then `atlas-filter-bar` (Life Dimension, status, timeframe, priority), then a sort control,
  then a card/list toggle.
- Each `atlas-destination-card` shows: dimension icon and label, title, short description, progress percentage with a
  slim bar, target date or range, status, next Waypoint, and an optional reward or "why it matters" note that is
  visually secondary.
- The empty state offers "Create Destination".

**Detail:**

1. A header: title, dimension, status, target date and Edit.
2. The purpose or success definition.
3. A progress and timeline summary.
4. Waypoints in chronological order (`atlas-waypoint-timeline`).
5. Connections to other Destinations (`atlas-connection-list`).
6. Notes and activity.
7. Financial, time or resource impact, only if supplied and labelled illustrative.
8. The reward or celebration.

The primary action is "Explore next waypoint". Steps are not shown by default.

| Breakpoint | List                                                                     | Detail                                                                                                             |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Desktop    | A card grid (3 columns at `xl`, 2 at `lg`). The table view is an option. | Main column plus a right insight panel (progress, Connections, reward). Text is limited to `--layout-reading-max`. |
| Tablet     | 2-column cards                                                           | One column. The insight panel moves below the Waypoints.                                                           |
| Mobile     | 1-column cards, with filters in a bottom sheet                           | Full-screen detail with a back affordance. Sections are ordered by the hierarchy above.                            |

**Destructive actions:** Delete (or archive, per §11.5) uses `atlas-confirm-dialog` and lists its effects: the
Waypoints, Steps, Connections and Awards that are affected.

## 3. Waypoints (§7.3)

**Index (`/waypoints`):** upcoming Waypoints across Destinations, grouped by Destination. The next unlocked Waypoint is
emphasised.

**Timeline:** vertical on mobile; horizontal or vertical on desktop, chosen by density. Each Waypoint shows:

- title;
- planned date (keeping its precision) and completion date;
- status and progress;
- lock or dependency state;
- reward;
- a short description.

**Route semantics:**

| Node      | Visual                                                          | Required text                                                                                       |
| --------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Completed | Success icon                                                    | "Completed" with the date                                                                           |
| Active    | Dimension foreground ring and action-colour "current" indicator | "In progress"                                                                                       |
| Future    | Neutral outline                                                 | "Not started" or "Upcoming"                                                                         |
| Blocked   | Blocked status icon                                             | "Blocked" with the reason                                                                           |
| Locked    | Subdued, with a lock icon                                       | "Locked until …". Only shown when a `GoalNodeDependency` exists; a lock is never implied otherwise. |

**Detail:**

1. A breadcrumb (Destination → … → Waypoint).
2. Purpose and acceptance criteria.
3. Start and due dates.
4. Status and progress.
5. A Steps preview.
6. Dependencies and connected Destinations.
7. Notes, resources and reward.

The primary action is "Open Steps".

**Accessibility:**

- The timeline is an ordered list; the visual route line is decorative.
- Each node's accessible name includes its title, status and date.

## 4. Steps (§7.4)

**List:**

- Grouped by Waypoint, with an optional board view later.
- Filters: due date, status, priority, Destination and Life Dimension.
- Each `atlas-step-row` has a status checkbox, title, due date, optional effort estimate and a notes indicator.

**Detail:**

- Title, description and completion criteria.
- Due date or reminder.
- Priority.
- Notes and links. Links are user-supplied only; never invent resources (project-instruction §6.2).
- Breadcrumbs to the parent Waypoint and Destination.
- Activity history.
- Complete action.

**Behaviour:**

- Completing a Step calls `POST …/complete`. The UI then shows the progress returned by the backend, with confirmation
  feedback through a snackbar or live region (§15).
- Reopening calls `POST …/reopen` and asks for confirmation, because derived progress changes.

| Breakpoint | Layout                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| Desktop    | The list with a detail side panel (`atlas-responsive-drawer`), so the list stays in context. |
| Tablet     | The list, with the detail in an overlay drawer.                                              |
| Mobile     | The list, with the detail on a full-screen page. Targets ≥ 48 px. No swipe-only actions.     |

## 5. Connections (§7.5)

**Purpose:** explain dependencies and cross-goal impacts.

**Default view:** `atlas-connection-list`, a table or list. It is the accessible alternative and the default on mobile.
The graph (`atlas-connection-graph`) is an enhancement on `lg` screens and above.

| Element      | Specification                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nodes        | Destinations or Life Dimensions, with labels                                                                                                                                                                                                                                                                                                                      |
| Edges        | The domain `GoalLink` types `SUPPORTS`, `DEPENDS_ON`, `CONFLICTS_WITH`, `AFFECTS` and `RELATED_TO`, plus within-goal `GoalNodeDependency`. The spec's categories (dependency, positive or negative impact, shared resource, financial effect) map onto these types plus an impact attribute (_to define_). Each type has a line style and a label, plus a legend. |
| Interactions | Pan, zoom, select, focus and reset, all keyboard operable. Selecting opens a side panel on desktop and a bottom sheet on mobile.                                                                                                                                                                                                                                  |
| Detail       | Source and target, type and description, direction and impact, an optional quantified effect with unit, currency and horizon (illustrative), assumptions or confidence, and related Waypoints or Steps.                                                                                                                                                           |

**Mock connection:** one cross-goal Connection is needed (§14), but there is only one Destination
([DD-31](DESIGN_DECISIONS.md#dd-31-one-mock-dataset)). The proposed resolution, still to be decided: show a
Destination ↔ Life Dimension connection, "Master's degree — AFFECTS → Finance: tuition and study costs over 2027–2030
(illustrative, amount not set)". This needs no second goal.

## 6. Journey Overview (§7.6)

**Purpose:** show movement across time, deadlines and life areas.

**Layout:**

- Time-range control: 3 months, 6 months, 1 year, 3 years, All.
- Filters: Life Dimension and status.
- A timeline with Destinations and their major Waypoints, a Today marker, deadline markers and milestone labels.
- A compact upcoming-deadlines list.
- An optional workload tab.

**Zoom:** at broad zoom show only Destinations and major Waypoints. At detail zoom, reveal Steps. Clicking a row opens
its detail. Never show every Step in the full-life overview.

| Breakpoint | Layout                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Desktop    | Full timeline with sticky row labels, if the chosen library supports them (ADR-0004 spike).                                |
| Tablet     | Simplified timeline with horizontal scroll. Touch targets ≥ 44 px.                                                         |
| Mobile     | A chronological agenda grouped by month, with compact timeline indicators. This is also the list alternative on all sizes. |

**Accessibility:**

- A text summary, such as "1 Destination, 7 Waypoints between Dec 2026 and end of 2030".
- Keyboard pan and zoom buttons.
- Reduced motion turns off animated zoom.

## 7. Milestone Awards (§7.7)

**Purpose:** celebrate meaningful progress in a mature, understated way.

**Main page:**

- A summary of earned Awards, recent achievements and the next potential Award.
- Grouped by Life Dimension or by achievement type.
- Each `atlas-award-card` shows the icon, title, date earned, associated Destination and reason.
- Locked Awards appear only if product rules define them. No streaks.

**Style:**

- A muted gold accent on `--color-surface-achievement`: `gold.light` (#A17A3F, light) or `gold.dark` (#D4B477, dark)
  for non-text, and `--color-text-achievement` for small text
  ([DD-34](DESIGN_DECISIONS.md#dd-34-figma-v3-tokens-typography-icons-and-brand-phase-2)).
- Medallion geometry with restrained linework. No trophies or confetti.
- One small celebration animation for a major achievement, disabled under reduced motion.

**Detail:** what was achieved, why it matters, the related Destination or Waypoint, the completion date and an optional
reflection.

**States:** each Award shows `PLANNED`, `EARNED` or `REDEEMED` as text.

**Mock:** "Graduation celebration", planned and linked to the Graduate Waypoint. Its content is user-defined
(_a personally meaningful graduation celebration_, §14).

## 8. Life Dimensions (§7.8)

**Index:** the seven dimensions in canonical order: Career / Profession, Finance, Health, Love / Partnership, Passion,
Friendship and Family. Each has an icon, accent, active Destination count and progress.

**Dimension page (`/dimensions/:dimensionKey`):** one shared template with a different accent. It shows:

- icon, accent and a user-editable intention;
- active Destinations and their progress;
- upcoming Waypoints;
- metrics, only when the user has supplied them;
- recent notes or reflections;
- connections to other dimensions.

**Style:**

- A dimension-coloured top border and icon, never a saturated background.
- Text uses the theme-aware dimension foreground (`--color-dimension-<key>`) on its tint, or neutral text
  ([DD-34](DESIGN_DECISIONS.md#dd-34-figma-v3-tokens-typography-icons-and-brand-phase-2)).
- The app chrome stays unchanged.

**Rules:**

- Labels can be customised only if product rules allow it. Keys never change (ADR-0006).
- An optional balance view must explain its score, must be hideable, and must never imply that equal scores define a
  good life.

**Empty:** dimensions without Destinations read "No Destinations yet" and offer "Create Destination". The dimension is
preselected in that action.

## Mock dataset (§14, project-instruction §10.5)

There is **one** development-only Destination. The mock repository must be replaceable by the HTTP repository, and no
sample values may be embedded in components.

| Level           | Item                                                                                                                                 | Date (precision)          | Illustrative status |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------------------- |
| Destination     | Complete an online Master's degree in Computer Science / AI. Career, ACTIVE.                                                         | Target end of 2030        | In progress         |
| Waypoint 1      | Submit application                                                                                                                   | December 2026 (month)     | In progress         |
| Steps           | Shortlist programmes ✓, Request transcripts ✓, and three more illustrative application Steps ("2 of 5 Steps done" in the wireframes) | —                         | —                   |
| Waypoint 2      | Receive admission decision                                                                                                           | Date not set              | Not started         |
| Waypoint 3      | Start studying                                                                                                                       | Fall 2027 (approximate)   | Not started         |
| Waypoint 4      | Complete foundational coursework. Generic placeholder children: Machine Learning, Deep Learning, AI Ethics                           | —                         | Not started         |
| Waypoint 5      | Complete elective coursework. Placeholders: Advanced Deep Learning, Advanced Generative Models                                       | —                         | Not started         |
| Waypoint 6      | Complete thesis/capstone. Optional, depending on actual programme requirements                                                       | —                         | Not started         |
| Waypoint 7      | Graduate                                                                                                                             | End of 2030 (approximate) | Not started         |
| Milestone Award | Graduation celebration, linked to Graduate                                                                                           | —                         | PLANNED             |
| Connection      | One cross-goal Connection: see [§5](#5-connections-75), resolution open                                                              | —                         | —                   |

Constraints:

- Make no claims about real programmes, course names, admission dates or rules (project-instruction §10.5).
- Make no tuition, income, loan or investment figures (§14).
- The design-foundation page uses this dataset too ([DD-31](DESIGN_DECISIONS.md#dd-31-one-mock-dataset)).
