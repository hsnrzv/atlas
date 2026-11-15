# IKIGAI ATLAS — UI/UX Design System & Copilot Implementation Instructions

> **Purpose:** Source of truth for creating an implementation-ready, editable design package and Angular UI foundations.
>
> **Product promise:** See the whole. Shape what matters.
>
> **Design direction:** Premium editorial + modern cartography: a personal command center combining an elegant investment dashboard, a journey visualization platform, and a calm personal-development companion.

## 0. GitHub Copilot operating instructions

Act as a senior product designer, design-systems engineer, Angular architect, and accessibility specialist.

### 0.1 Figma V3 precedence (corrected 2026-11-14)

The approved Figma file **`zlFVZJ57AYBHUBhoIsT030`** (IKIGAI ATLAS V3, "Quiet Tide") is the source of truth for visual styling: colour, typography, spacing, radius, icon size and stroke, component anatomy and page layouts in dark and light themes. When this document and Figma disagree on a visual value, **Figma wins** (ADR-0010). Figma is used at design time only: values are translated into the code base during development (Copilot-assisted, reviewed in a PR), and the application, build and CI never depend on Figma. Accessibility is checked on the implementation; a Figma value that fails WCAG 2.2 AA is reported as a conflict, never silently changed. This document has been corrected to match V3 where the differences were known; remaining values are in:

- `docs/design/figma-handoff.md`: pages, canonical frames, node IDs, states, prototype flows and the MCP workflow.
- `docs/design/design-tokens.md`: Figma variables mapped to `design/tokens/*.json` and CSS custom properties, contrast results and the design-time translation process.
- `docs/design/component-mapping.md`: every `Atlas/V3/*` component mapped to an Angular component.
- `docs/architecture/frontend.md` and `docs/implementation/roadmap.md`: architecture and delivery order.

Behaviour, domain rules, accessibility requirements and the "no invented data" rules in this document and in `project-instruction.md` still apply. Figma prototype frames are static: search, filters, zoom, save and companion preferences are previews, not behaviour specifications.

Sections that still describe the pre-V3 direction (warm ivory, navy, DM Serif, compass logo) are marked **Superseded by Figma V3** below.

### Required workflow

1. Inspect the existing frontend repository before changing files. Identify Angular and Capacitor versions, build system, styling approach, routing, tests, and native iOS/Android structure.
2. Create a design implementation plan before coding. List files, dependencies, risks, platform considerations, and verification steps.
3. Do not overwrite working code or introduce a second design system without explaining why.
4. Implement in small phases. After each phase, run formatting, lint, tests, and build checks available in the repository.
5. Treat design tokens as the single source of truth in code; their values are translated from the Figma V3 variables at design time (§0.1). Do not scatter hard-coded brand colors, spacing, radii, shadows, or typography values.
6. Build reusable components and page templates, not eight unrelated implementations.
7. Use semantic HTML, keyboard-accessible interactions, visible focus states, reduced-motion support, and WCAG 2.2 AA contrast targets.
8. Use Angular-native patterns and CSS/Sass compatible with web, iOS and Android WebViews. Do not depend on hover for essential interactions.
9. Create editable SVG source assets. Never rasterize the master logos. Generate raster platform assets as derived outputs.
10. Keep the experience premium and restrained: no childish gamification, neon palettes, excessive gradients, excessive rounded cards, or decorative chart clutter.

### Deliverable structure

Adapt to existing repository conventions, but create the equivalent of:

```text
design/
  README.md
  DESIGN_DECISIONS.md
  BRAND_GUIDELINES.md
  ACCESSIBILITY.md
  RESPONSIVE_BEHAVIOR.md
  COMPONENT_CATALOG.md
  PAGE_SPECIFICATIONS.md
  ASSET_EXPORTS.md
  tokens/
    design-tokens.json
    colors.json
    typography.json
    spacing.json
    elevation.json
    motion.json
  svg/
    logo/
      ikigai-atlas-symbol.svg
      ikigai-atlas-wordmark.svg
      ikigai-atlas-lockup-horizontal.svg
      ikigai-atlas-lockup-stacked.svg
      ikigai-atlas-monochrome.svg
      ikigai-atlas-app-icon-master.svg
    dimensions/
      career.svg
      finance.svg
      health.svg
      love.svg
      passion.svg
      friendship.svg
      family.svg
  exports/
    app-icon/
    splash/
    social/
  mockups/
    app-shell-desktop.svg
    app-shell-mobile.svg
```

Keep master SVGs separate from generated PNGs. If the repo has an established asset layout, document the mapping.

### Implementation phases

- A: repository inspection and design decisions.
- B: brand assets, palette, typography and tokens.
- C: Angular theme foundation, global styles and icon conventions.
- D: responsive application shell and navigation.
- E: reusable components and visualization primitives.
- F: page templates for the eight named areas.
- G: accessibility, visual regression and Capacitor asset validation.
- H: documentation and handover.

Do not implement backend behavior or real user data in this design package. Use one coherent mock dataset only.

---

# 1. Brand foundations

## 1.1 Brand essence

IKIGAI ATLAS helps a person see their whole life, understand how goals connect, and make deliberate progress without being overwhelmed.

Brand attributes: intentional, ambitious, intelligent, optimistic, premium, human, structured, calm.

**Main tagline:** See the whole. Shape what matters.

**Supporting line:** Your life, mapped with purpose.

Use the main tagline in onboarding, app-store marketing and brand materials, not on every screen.

## 1.2 Visual metaphor

Use modern cartography as a subtle visual language:

- The whole life is the atlas.
- Life Dimensions are regions.
- Destinations are meaningful outcomes.
- Waypoints are milestones.
- Steps are actionable tasks.
- Connections show dependencies and impact.
- Journey Overview shows movement over time.
- Milestone Awards celebrate meaningful progress.

Use route lines, waypoint dots, map-grid references, contour-like curves and connected nodes sparingly. These elements support information hierarchy; they must not become decorative noise.

## 1.3 Logo concept and variants

**Figma V3 (pages 01 Brand and 15 Export Assets):** the symbol is **four overlapping circles with a shared centre**, the four Ikigai circles: top `#5685B5`, left `#348F84`, right `#8A73BB`, bottom `#B17D9E`. They are distinct from the seven Life Dimensions. Variants: Theme Dark/Light × Color/Mono, horizontal lockup 232 × 48, stacked lockup 172 × 138. The wordmark "IKIGAI ATLAS" is Manrope Bold 22/30 with 1 px tracking. Proofs at 24, 32, 48 and 64 px.

*Superseded by Figma V3:* the earlier concept was a geometric compass/atlas symbol with seven connected waypoint nodes around a central point.

The symbol must:
- Remain legible at 16–24 px.
- Work in one color and on light/dark backgrounds.
- Avoid thin details that disappear at small sizes.
- Avoid looking like a generic location pin, navigation app or cryptocurrency logo.
- Be optically balanced.
- Use editable SVG shapes/paths, with no embedded raster images or external image references.

Create:
1. Symbol only.
2. Wordmark only.
3. Horizontal lockup.
4. Stacked lockup.
5. Monochrome light and dark variants.
6. App icon master.

Use the exact wordmark **IKIGAI ATLAS** in Manrope Bold. Retain editable text in the master SVG and document font dependencies; outline text only in derived exports if necessary.

---

# 2. Color system

## 2.1 Core palette — "Quiet Tide" (Figma V3)

The interface is **dark-first with an equal light theme**: deep indigo/navy surfaces, a calm green for actions and progress, violet for focus and the signature edge, and muted gold only for achievement. Full primitive and semantic tables, CSS names and the design-time translation process are in `docs/design/design-tokens.md`.

Dark primitives: space `#0B1020`, indigo `#151B35`, navy `#202A46`, panel `#273452`, border `#36435D`, muted `#8290AA`, secondary `#A8B4CC`, white `#F5F7FC`, forest `#123F3C`, jade `#205D55`, emerald `#2D7266`, teal `#4B9387`, violet-deep `#493566`, violet `#65518C`, purple `#8469B5`, accent violet `#B8A5D0`, gold `#D4B477`.

Light primitives: page `#F5F7FA`, card `#FFFFFF`, raised `#EAF0F4`, green surface `#E8F1EE`, text `#1D2935`, secondary `#586578`, action `#2D6A61`, border `#DCE4E9`, gold `#A17A3F` (decorative or large text only; 3.91:1 on white).

| Semantic role | Dark | Light |
|---|---|---|
| Page background | `#0B1020` | `#F5F7FA` |
| Navigation background | `#151B35` | `#FFFFFF` |
| Card surface | `#202A46` | `#FFFFFF` |
| Raised surface | `#273452` | `#EAF0F4` |
| Subtle surface | `#151B35` | `#E8F1EE` |
| Text primary | `#F5F7FC` | `#1D2935` |
| Text secondary / muted | `#A8B4CC` | `#586578` |
| Achievement text | `#D4B477` | `#765728` |
| Achievement surface | `#2E2B27` | `#F4EFE5` |
| Primary action (fill) | `#205D55` | `#2D6A61` |
| Action hover / pressed | `#2D7266` / `#123F3C` | `#205D55` / `#123F3C` |
| Label on action | `#F5F7FC` | `#FFFFFF` |
| Border subtle / control / action | `#36435D` / `#8290AA` / `#4B9387` | `#DCE4E9` / `#798B88` / `#2D6A61` |
| Focus ring (2 px, outside) | `#B8A5D0` | `#65518C` |
| Progress fill / track | `#4B9387` / `#273452` | `#2D6A61` / `#DCE4E9` |

**Signature edge:** a thin gradient on the **top edge only** of hero and selected surfaces (dark `#123F3C` → `#205D55` → `#353D60` → `#493566`; light `#76968D` → `#71918E` → `#858B9E` → `#9583AE`). Never a full coloured border or background.

Rules:
- Gold is for achievement only, not a default text or action colour.
- Primary actions are green, not navy or gold.
- No glass, blur or background imagery behind content.

*Superseded by Figma V3:* the warm ivory canvas, midnight-navy structure and gold primary emphasis (`brand-midnight-*`, `brand-ivory-*`, `brand-gold-*`, `neutral-*`).

## 2.2 Life Dimension accents

Each dimension has a foreground (text, icon, chart series) and a background (chip, badge, tint) per theme.

| Dimension | Dark fg / bg | Light fg / bg |
|---|---|---|
| Career / Profession | `#A6C3DF` / `#1B2D44` | `#426D9B` / `#EAF1F8` |
| Finance | `#D4B477` / `#302A24` | `#805B2F` / `#F6EFE3` |
| Health | `#9BBBA7` / `#1B302C` | `#52765B` / `#EDF3EE` |
| Love / Partnership | `#D5A498` / `#35242E` | `#965B4A` / `#F8EEEA` |
| Passion | `#B8A5D0` / `#2C263D` | `#6F5C98` / `#F1EEF7` |
| Friendship | `#9AC2BC` / `#193337` | `#3F7776` / `#EAF3F2` |
| Family | `#C6B184` / `#302C25` | `#80683E` / `#F5F0E5` |

Use the foreground for icons, chart series, small labels, timeline markers and selected states, and the background for chips and panels. Finance and Family must remain distinguishable by icon, label and tint. Never communicate dimension identity by color alone.

## 2.3 Semantic status colors

| Meaning | Badge label | Dark fg / bg | Light fg / bg |
|---|---|---|---|
| Success / completed | Completed (ADR-0006; Figma badges say "Achieved", see roadmap R-11) | `#9BBBA7` / `#1B302C` | `#2D6A61` / `#E8F1EE` |
| In progress | In progress | `#A6C3DF` / `#1B2D44` | `#426D9B` / `#EAF1F8` |
| Upcoming | Upcoming | `#D4B477` / `#2E2B27` | `#765728` / `#F4EFE5` |
| At risk | At risk | `#D6AE8F` / `#2E2B27` | `#8F5D36` / `#F4EFE5` |
| Blocked | Blocked | `#DBA6A6` / `#35242E` | `#924D53` / `#F8EEEA` |
| Neutral / not started | Not started | `#A8B4CC` / `#273452` | `#586578` / `#EAF0F4` |

Pair each semantic color with text and an icon. Do not use red/green alone. Availability (open/blocked by a prerequisite) is shown separately from status: "Availability is not status".

## 2.4 Dark theme

Dark and light are both first-class in V3; Figma presents dark first. The app follows the system preference, uses dark when no preference is known, and lets the user choose (stored as a non-sensitive preference). Use navy/indigo variations, not pure black. Every semantic role has a verified value in both themes (`design/tokens/contrast-pairs.json`).

---

# 3. Typography

## 3.1 Font recommendation

**Figma V3:** use **Manrope** (SIL Open Font License) for headings and the wordmark, and **Inter** (SIL Open Font License) for body, labels, controls, metrics and data. Never use the heading font for dense data, controls or small text.

*Superseded by Figma V3:* DM Serif Display for editorial hero moments.

Bundle font files locally for reliable offline/mobile rendering. Do not depend on third-party font CDNs at runtime (the CSP allows no font origins). If font packaging is unsuitable, fall back to system sans-serif.

```css
--font-heading: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

## 3.2 Type scale

| Token | Family | Desktop size / line-height | Mobile size / line-height | Weight |
|---|---|---|---|---|
| Display | Manrope | 48 / 56 px | 36 / 42 px | 700 |
| H1 | Manrope | 36 / 44 px | 30 / 38 px | 700 |
| H2 | Manrope | 28 / 36 px | 24 / 32 px | 600 |
| H3 | Manrope | 22 / 30 px | 20 / 28 px | 600 |
| H4 | Manrope | 18 / 26 px | 18 / 26 px | 600 |
| Body large | Inter | 16 / 26 px | 16 / 24 px | 400 |
| Body | Inter | 14 / 22 px | 14 / 22 px | 400 |
| Label | Inter | 12 / 16 px | 12 / 16 px | 600 |
| Control | Inter | 14 / 22 px | 14 / 22 px | 600 |
| Caption | Inter | 11 / 16 px | 11 / 16 px | 400 |
| Metric | Inter | 32 / 38 px | 28 / 34 px | 600 |
| Wordmark | Manrope | 22 / 30 px, +1 px tracking | same | 700 |

Use tabular numerals for financial values, percentages, dates and chart labels. Avoid all-caps for long labels.

---

# 4. Layout, spacing and shape language

## 4.1 Grid and shell dimensions

- Desktop content max width: 1440 px.
- Desktop horizontal padding: 32 px (24 px on narrower desktops).
- Tablet horizontal padding: 24 px.
- Mobile horizontal padding: 16 px.
- Desktop sidebar: 248 px expanded, 76 px collapsed.
- Top bar: 68 px desktop, 56 px compact/mobile.
- Long-form detail reading width: 840 px.
- Use 12-column desktop, 8-column tablet, 4-column mobile grids when appropriate.

## 4.2 Spacing scale

Use a 4 px base unit:

| Token | Value |
|---|---:|
| `space-0` | 0 px |
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |
| `space-20` | 80 px |

Use 8/12/16/24/32 px as common component rhythm. Document any exceptions.

## 4.3 Radius and elevation

- Small control: 8 px.
- Standard card: 12 px.
- Feature card/modal: 16 px.
- Hero panel: 20 px.
- Pill: 999 px, reserved for tags, filters and compact badges.

Figma V3 is **flat**: separate surfaces with surface contrast and subtle borders, not shadows. No glass or background blur. Shadows are used only for overlays (dialog, drawer/sheet, popover, toast):
- Level 0: none (cards, panels, navigation).
- Levels 1–3: overlay shadows from the elevation tokens, with a dark-theme override that uses a black alpha. Values live in `design/tokens/` (see `docs/design/design-tokens.md` §5.3).

Selected and hero surfaces may carry the signature edge (§2.1) on the top edge only. Card radii are confirmed per component from Figma during implementation.

## 4.4 Motion

- Micro interaction: 120–160 ms.
- Standard transition: 180–240 ms.
- Page/overlay transition: 240–320 ms.
- Use ease-out for entrances and ease-in-out for state changes.
- Respect `prefers-reduced-motion`.
- Do not animate every card/chart on each render. Progress can animate once after a user action.

---

# 5. Iconography and illustration

## 5.1 Icon library

Use **Tabler Icons** (MIT, ADR-0005) through the `AtlasIcon` component and its semantic registry (`src/app/shared/icons`). Figma V3 component `Atlas/V3/Icon` (`152:2139`) contains the 36 approved glyphs.

*Superseded by Figma V3:* Lucide and a 1.75 stroke.

Conventions:
- Stroke width: **2** (Figma `icon/stroke`).
- Sizes: 16, 20, 24 px; 24 px (`icon/size`) for primary navigation, 20 px for buttons/list rows, 16 px for inline metadata.
- Consistent outline family; do not mix unrelated filled and outline sets.
- Icon-only buttons require accessible names and tooltips where useful; icons next to text are `aria-hidden`.
- Never use emoji as UI icons.

The area, action and state glyph mapping (Figma node → registry key → Tabler icon) is in `docs/design/component-mapping.md` §2. Primary areas: My Atlas `compass`, Destinations `flag`, Waypoints `map-pin`, Steps `list-check`, Connections (network glyph, Tabler equivalent to verify), Journey Overview `route`, Milestone Awards `award`, Life Dimensions `orbit`.

Life Dimension icons are Tabler outline glyphs rendered through `<atlas-icon>` (names in `design/tokens/design-tokens.json → lifeDimensions.icons`): 24 × 24 grid, consistent stroke, `currentColor`, no embedded color.

## 5.2 Illustration style

Use minimal line illustrations and abstract route/waypoint motifs. Avoid stock-photo-heavy dashboards. If future marketing uses photography, choose authentic editorial imagery with warm natural light. Product screens remain typography- and data-led.

---

# 6. Information architecture and application shell

## 6.1 Primary navigation

Desktop sidebar, in this order:

1. My Atlas
2. Destinations
3. Waypoints
4. Steps
5. Connections
6. Journey Overview
7. Milestone Awards
8. Life Dimensions

Place Settings, Profile and Help at the bottom, separated from primary navigation. Brand symbol and wordmark sit at the sidebar top. The sidebar uses the navigation background (dark `#151B35`, light `#FFFFFF`).

Active state (Figma `Atlas/V3/Navigation/Item`, `152:2587`): the green success surface (dark `#1B302C`, light `#E8F1EE`) with primary text; dark adds a teal `#4B9387` icon accent, light has no accent (verified in Figma variables); always with `aria-current="page"`, not a bright oversized highlight. *Superseded by Figma V3:* the narrow gold indicator on a lighter navy surface.

## 6.2 Desktop

- Fixed/sticky left sidebar.
- Top bar with page title/breadcrumb, global search, quick-add, notifications and profile. Search and quick-add are rendered only once they work (roadmap R-14); no disabled placeholders.
- Main content on the page background token (dark `#0B1020`, light `#F5F7FA`). *Superseded by Figma V3:* warm ivory canvas.
- Clear page header, primary content and optional secondary insight panel.
- Keep content readable on ultrawide screens.

## 6.3 Tablet

- Collapsible sidebar or compact rail.
- Preserve primary actions and page title.
- Convert multi-column layouts to one or two columns.
- Allow horizontal scrolling or a simplified list for dense timeline/graph views.

## 6.4 Mobile / Capacitor

- Compact top app bar and bottom navigation (Figma `Atlas/V3/BottomNavigation`, `152:5351`, **80 px** high plus the bottom safe area).
- At most five bottom-nav destinations: My Atlas, Destinations, Journey, Awards, More.
- More opens a sheet (Figma page 05, "More sheet") exposing Waypoints, Steps, Connections and Life Dimensions.
- Respect iOS/Android safe areas.
- Keep dialogs and bottom sheets clear of system navigation areas.
- Touch targets at least 44 × 44 CSS px; prefer 48 px.
- No essential hover interactions.
- Use correct input types and keyboard modes.
- Handle keyboard resize and focused-input scrolling in Capacitor WebViews.

## 6.5 Navigation behavior

- Destination opens its detail view.
- Waypoint drills into its next level.
- Step opens a detail panel/page.
- Breadcrumbs expose hierarchy and allow back navigation without losing context.
- Mobile uses a back affordance and compact breadcrumb context.
- Support deep links to a Destination, Waypoint or Step, subject to app routing/authentication.

---

# 7. Page specifications

All pages share the shell, typography, spacing, controls and interaction language. Include loading, empty, populated, error and disabled states where relevant.

**Figma V3:** every page below has approved desktop (1440), tablet (768) and mobile (390) frames in dark and light, plus Empty, Loading, Error and page-specific states. The canonical frames, node IDs and states per page are listed in `docs/design/figma-handoff.md` §3; the page-to-component breakdown is in `docs/design/component-mapping.md` §7. Where the frames and the lists below differ, the frames win on layout and the lists below still define required behaviour.

## 7.1 My Atlas

**Purpose:** Immediate, motivating overview without overwhelming detail.

Desktop composition:
1. Greeting and concise headline: “Build the life you envision.”
2. Date/context line.
3. Main summary: overall journey status, active Destinations, completed Waypoints and upcoming deadlines.
4. Seven Life Dimension cards in a balanced grid or subtle atlas-inspired overview.
5. “Next Waypoints” list with the next 3–5 important milestones.
6. “Recent Progress” feed.
7. Optional “Needs Attention” for overdue or blocked items.
8. Quick Capture action.

Visual treatment:
- Page background token; hero on the hero surface with the signature edge (Figma: "Build the life you envision." with the Destination metric). *Superseded by Figma V3:* ivory canvas and navy map-grid hero.
- Dimension cards use card surfaces, small accent icons and slim progress indicators.
- With no Destinations, show the Figma Empty state (the default after onboarding).
- Avoid a wall of KPI cards; emphasize one next milestone.

Mobile:
- Stack hero and summary.
- Use a horizontal dimension carousel or compact two-column grid.
- Show the next waypoint before secondary analytics.
- Keep quick-add reachable without obscuring content.

Actions: view a dimension, open a Destination, complete a Step, add a note, create a Destination, open Journey Overview.

## 7.2 Destinations

List:
- Page title and concise explanation.
- Search, filters and sort.
- Filter/group by Life Dimension, status, timeframe and priority.
- Cards or compact list/table toggle.
- Each item shows title, dimension, target date, progress, status, next Waypoint and optional reward.
- Empty state and Create Destination action.

Destination card:
- Dimension icon/accent.
- Title and short description.
- Progress percentage and slim progress line.
- Target date/range and status.
- Next Waypoint.
- Optional “why it matters” or reward note, visually secondary.

Detail:
- Header with title, dimension, status, target date and edit.
- Purpose statement / success definition.
- Progress and timeline summary.
- Chronological Waypoints.
- Connections to other Destinations.
- Notes/activity.
- Financial/time/resource impact if supplied.
- Reward/celebration definition.

Clicking a Destination drills into Waypoints. Do not expose every Step by default. Primary drill-down action: “Explore next waypoint”.

## 7.3 Waypoints

- Show as vertical timeline on mobile and appropriate horizontal/vertical timeline on desktop.
- Each Waypoint includes title, planned date, status, completion date, progress, dependency/lock state, reward and short description.
- Show the next unlocked Waypoint clearly.
- Locked Waypoints remain visible but subdued, with an explanation.
- Never imply a lock unless the domain model defines a dependency.

Detail view:
- Title and parent Destination breadcrumb.
- Purpose and acceptance criteria.
- Start/due dates.
- Status/progress.
- Steps preview.
- Dependencies and connected Destinations.
- Notes, resources and reward.
- “Open Steps” action.

Route semantics:
- Completed node: success.
- Active node: relevant dimension accent.
- Future node: neutral outline.
- Blocked node: semantic blocked state plus text.

## 7.4 Steps

Views:
- List grouped by Waypoint.
- Optional board/list presentation.
- Filters: due date, status, priority, Destination and Life Dimension.
- Row includes status control, title, due date, optional effort estimate and notes indicator.

Detail:
- Title, description, completion criteria.
- Due date/reminder metadata.
- Priority.
- Notes and links/resources.
- Parent Waypoint and Destination breadcrumbs.
- Activity/history.
- Completion action.

Completing a Step updates derived progress according to the domain's progress policy. Do not invent progress math in UI components. Display backend-provided progress or use a documented shared calculation for mock data. Confirm destructive/reversal actions if reopening a completed Step is allowed.

## 7.5 Connections

Purpose: explain dependencies and cross-goal impacts.

Graph:
- Nodes represent Destinations or Life Dimensions.
- Edges represent dependency, positive impact, negative impact, shared resource or financial effect.
- Include labels and a legend.
- Use line styles as well as color.
- Provide a list/table alternative for accessibility and mobile.

Connection detail:
- Source and target.
- Relationship type and description.
- Direction and impact.
- Optional quantified effect, currency/unit and time horizon.
- Assumptions/confidence where relevant.
- Related Waypoint/Step.

Mock examples:
- Moving in together may reduce household rent costs and make a current apartment available for rental income.
- A master's degree may add tuition and study-related costs over a defined period.
- A career transition may increase future earning potential but require learning time and certification costs.

Examples are illustrative. Never invent financial values or present estimates as guaranteed facts.

Graph interactions: pan/zoom, select, focus, reset. On mobile default to a relationship list or focused node view. Selecting a node opens a side panel on desktop and bottom sheet on mobile.

## 7.6 Journey Overview

Purpose: show movement across time, deadlines and life areas.

Main layout:
- Time range: 3 months, 6 months, 1 year, 3 years, all.
- Timeline/Gantt-like overview with Destinations and important Waypoints.
- Filters by Life Dimension and status.
- Today marker, deadline markers and milestone labels.
- Compact upcoming-deadlines list.
- Optional workload/resource view in secondary tab.

Visualization:
- Wrap the timeline in `AtlasJourneyTimeline` (see §9): vis-timeline per `project-instruction.md` §9, or native SVG/CSS if the P-V1 spike shows a better fit.
- Provide zoom and horizontal pan.
- Collapse low-priority detail at broad zoom.
- Broad zoom: Destinations and major Waypoints only.
- Detail zoom: reveal Steps.
- Clicking a row opens detail.
- Never show every Step in the full-life overview.

Responsive:
- Desktop: full timeline with sticky labels if supported.
- Tablet: simplified timeline with horizontal scrolling.
- Mobile: chronological agenda/list grouped by month with compact timeline indicators.

## 7.7 Milestone Awards

Purpose: celebrate meaningful progress in a mature, understated way.

Main page:
- Earned award summary, recent achievements and next potential award.
- Group by Life Dimension or achievement type.
- Cards show icon, title, date earned, associated Destination and reason.
- Show locked awards only if product rules define them; avoid manipulative streaks or arbitrary reward loops.

Style:
- Muted gold accent.
- Elegant badge/medallion geometry, restrained linework and subtle texture.
- No cartoon trophies or arcade-style effects.
- Small one-time celebration animation is acceptable for a major achievement; respect reduced motion.

Detail: what was achieved, why it matters, related Destination/Waypoint, completion date and optional reflection.

## 7.8 Life Dimensions

Dimensions:
1. Career / Profession.
2. Finance.
3. Health.
4. Love / Partnership.
5. Passion.
6. Friendship.
7. Family.

Each dimension page:
- Icon, accent and user-editable intention.
- Active Destinations and progress.
- Upcoming Waypoints.
- Relevant metrics only when user has supplied them.
- Recent notes/reflections.
- Connections to other dimensions.

Use a shared page template with a different accent. Keep app chrome consistent. Use dimension-colored top border/icon, not a fully saturated background. Only allow renaming/customization if product rules permit; preserve canonical identity internally.

Optional balance view: never imply mathematical equality is the definition of a good life. Explain score calculation and let users hide it.

---

# 8. Reusable Angular component catalogue

**Figma V3:** the authoritative list is `docs/design/component-mapping.md`, which maps every `Atlas/V3/*` component and variant (page 03 Components, page 04 App Shell) to an Angular component, its inputs and its backlog item. The names below are the original intent; the mapping file's names win.

Create reusable components with typed inputs/outputs, accessibility and responsive behavior:

- `AppShellComponent`
- `DesktopSidebarComponent`
- `MobileBottomNavigationComponent`
- `TopBarComponent`
- `PageHeaderComponent`
- `BreadcrumbsComponent`
- `DimensionBadgeComponent`
- `StatusBadgeComponent`
- `ProgressIndicatorComponent`
- `MetricCardComponent`
- `DestinationCardComponent`
- `WaypointTimelineComponent`
- `WaypointNodeComponent`
- `StepListComponent`
- `StepRowComponent`
- `ConnectionGraphComponent`
- `ConnectionListComponent`
- `JourneyTimelineComponent`
- `AwardCardComponent`
- `EmptyStateComponent`
- `LoadingSkeletonComponent`
- `ErrorStateComponent`
- `FilterBarComponent`
- `SearchFieldComponent`
- `QuickAddMenuComponent`
- `NotesPanelComponent`
- `DateLabelComponent`
- `ResponsiveDrawerComponent`
- `ConfirmDialogComponent`
- `Toast/NotificationComponent`

Component rules:
- Standalone Angular components (no NgModules).
- Keep components presentational where possible; do not embed domain rules.
- Use typed inputs and outputs.
- Use `OnPush` and signals; forms use Angular Signal Forms (ADR-0009).
- Avoid unnecessary state-management dependencies in the mock phase.
- Keep global styles minimal; component styles consume tokens.
- Add Storybook only if already present or justified by maintenance needs.

---

# 9. Visualization conventions

Use the right tool for each visualization; do not force one library to solve every problem.

**Figma V3 approach:** `project-instruction.md` §9 and ADR-0004 select Apache ECharts (+ ngx-echarts) and vis-timeline, with D3 only as a fallback. A time-boxed spike at the start of roadmap item P-V1 compares them with native SVG against the Figma `GraphNode`, `GraphConnector` and `TimelineMarker` components (fidelity, keyboard and screen-reader access, CSP, bundle size); ADR-0004 records the result (roadmap R-7, trade-off T-A). Libraries always sit behind Atlas wrappers in `shared/visualization`. The Waypoint route is an ordered list styled with CSS/SVG. Graph connectors map to `GoalLink` types by line style and legend label (`docs/design/component-mapping.md` §6).

- Charts: Apache ECharts behind an Atlas wrapper when a chart is needed.
- Timeline: vis-timeline or native SVG/CSS, decided by the spike. Avoid paid-only timeline features.
- Calendar: use an open-source standard calendar view; avoid premium-only timeline/resource features.
- Relationship graph: ECharts graph or native SVG, decided by the spike. A list alternative is mandatory.
- Cartographic ornamentation: SVG and CSS.

Chart rules:
- Dimension accent colors for series.
- Neutral (text secondary) axes and labels.
- Minimal gridlines; no 3D charts or decorative gauges.
- Always label units and date ranges.
- Use direct labels where practical.
- Provide textual summary/table alternative.
- Do not imply precision beyond source data.
- Gold highlights selected series or achievements, not every dataset.

Before adding dependencies, check license, maintenance, Angular compatibility, bundle impact and whether the existing stack can meet the need.

---

# 10. Design tokens and Angular styling foundation

## 10.1 Token architecture

JSON tokens in `design/tokens/*.json` are canonical in code, and their values are translated from the Figma V3 variables at design time and reviewed in a PR (`docs/design/design-tokens.md` §6). There is no Figma sync or drift check in the build or CI. CSS custom properties are generated with `npm run tokens:build`; never edit `*.generated.*` files or keep divergent manual copies.

Required token groups:
- Primitive palette, semantic colors, dimension accents and status colors.
- Font families, sizes, weights, line heights and letter spacing.
- Spacing, radius, elevation and motion.
- Breakpoints, layout dimensions and z-index layers.

## 10.2 CSS foundation example

The generated files (`src/styles/tokens/*.generated.scss`) are the reference; this abbreviated example shows the V3 shape (dark default, light via `prefers-color-scheme` or the user's choice). Implement the complete token set listed in `docs/design/design-tokens.md`:

```css
:root,
[data-theme="dark"] {
  color-scheme: dark;

  --color-surface-page: #0B1020;
  --color-surface-navigation: #151B35;
  --color-surface-card: #202A46;
  --color-surface-raised: #273452;
  --color-text-primary: #F5F7FC;
  --color-text-secondary: #A8B4CC;
  --color-action-primary: #205D55;
  --color-action-on-primary: #F5F7FC;
  --color-border-subtle: #36435D;
  --color-focus-ring: #B8A5D0;
  --color-progress-fill: #4B9387;
  --color-progress-track: #273452;
  --color-dimension-career: #A6C3DF;
  --color-dimension-career-tint: #1B2D44;
}

[data-theme="light"] {
  color-scheme: light;

  --color-surface-page: #F5F7FA;
  --color-surface-navigation: #FFFFFF;
  --color-surface-card: #FFFFFF;
  --color-surface-raised: #EAF0F4;
  --color-text-primary: #1D2935;
  --color-text-secondary: #586578;
  --color-action-primary: #2D6A61;
  --color-action-on-primary: #FFFFFF;
  --color-border-subtle: #DCE4E9;
  --color-focus-ring: #65518C;
  --color-progress-fill: #2D6A61;
  --color-progress-track: #DCE4E9;
  --color-dimension-career: #426D9B;
  --color-dimension-career-tint: #EAF1F8;
}

:root {
  --font-heading: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-pill: 999px;

  --layout-sidebar-expanded: 248px;
  --layout-sidebar-collapsed: 76px;
  --layout-topbar-height: 68px;
  --layout-bottom-nav-height: 80px;
  --layout-content-max: 1440px;
}
```

*Superseded by Figma V3:* the earlier example with `--color-brand-midnight-*`, `--color-brand-ivory-*`, `--color-brand-gold-*`, `--font-display: "DM Serif Display"` and navy-tinted shadows.

## 10.3 Angular integration

- Use global `styles.scss` for reset/base typography, font declarations, tokens, theme setup and minimal global utilities.
- Use component SCSS for local layout.
- Angular Material is installed: theme it through supported APIs, mapping its system variables to the semantic tokens in both themes. Prevent default Material colors from leaking into the app.
- Override Material components through supported theming APIs, not brittle deep selectors.
- Theme buttons, form fields, dialogs, menus, tooltips, tabs and snackbars.
- Avoid broad `::ng-deep` selectors.
- Keep Capacitor adjustments in a dedicated stylesheet and use safe-area environment variables.

## 10.4 Responsive breakpoints

| Name | Width |
|---|---:|
| `xs` | 0–479 px |
| `sm` | 480–767 px |
| `md` | 768–1023 px |
| `lg` | 1024–1279 px |
| `xl` | 1280–1535 px |
| `2xl` | 1536 px and above |

Use content-driven breakpoints when a layout stops working; do not assume every device fits a category.

---

# 11. Accessibility

Target WCAG 2.2 AA.

Must include:
- Contrast checks for text, controls, badges and chart labels.
- Keyboard navigation and logical focus order.
- Visible focus ring.
- Accessible names for icon-only buttons.
- Proper heading hierarchy.
- Form labels and clear validation messages.
- Status communicated in text, not color alone.
- Screen-reader summaries for charts/graphs.
- Alternative list/table view for complex visualizations.
- Reduced-motion support.
- Touch targets at least 44 × 44 CSS px.
- Dialog focus management and Escape behavior.
- No essential hover-only content.
- Avoid color combinations that create avoidable color-vision ambiguity.

Create `ACCESSIBILITY.md` and run automated checks where tooling exists. Automated tools do not replace manual keyboard and screen-reader testing.

---

# 12. Capacitor, App Store and Android assets

Master logos remain vector SVG. Platform stores and launchers require raster/native assets, so generate those from master sources with a reproducible export process.

## 12.1 App icon master

Create square SVG master:
- 1024 × 1024 viewBox.
- Figma V3 (page 15 Export Assets): the four-circle Ikigai symbol (§1.3) centred on an opaque background, in a dark variant (page background `#0B1020`) and a light variant (`#F5F7FA`).
- *Superseded by Figma V3:* midnight navy `#14243A` with an ivory/gold compass mark.
- Strong silhouette; no text.
- Generous safe area.
- No tiny lines, fine text or details that disappear at small sizes.

Generate derived assets:
- iOS App Store marketing icon: 1024 × 1024 PNG, RGB, no transparency.
- Android adaptive icon foreground/background per current Android guidance.
- Android legacy density assets if required by the generated project.
- Google Play listing icon: 512 × 512 PNG.
- Splash artwork with centered symbol and solid brand background (dark and light, per Figma page 15).

Do not assume one PNG is sufficient for iOS and Android. Verify current Capacitor and native platform requirements.

## 12.2 iOS / App Store Connect

- Keep editable SVG master in source control.
- Export required PNG through a deterministic script/tool.
- Validate dimensions, color profile and transparency.
- Configure the generated icon in the iOS asset catalog (`AppIcon.appiconset`) using supported Xcode/Capacitor workflow.
- Verify in an actual iOS build and simulator/device.
- Prefer supported asset generation over manually editing generated native project files.
- App Store Connect marketing assets and app-bundle icon assets are related but not interchangeable; follow current Apple upload requirements.

## 12.3 Android Studio / Google Play

- Create adaptive foreground/background per current Android guidance.
- Foreground artwork must respect safe zone and survive circle, rounded-square and squircle masks.
- Generate required mipmap assets through native Android resource workflow.
- Keep Play Store listing icon separate from launcher adaptive icon assets.
- Verify multiple launcher masks and emulator/device densities.

## 12.4 Export documentation

`ASSET_EXPORTS.md` must document source file, export tool/version, exact command/script, output path/dimensions, color profile/transparency, platform destination and validation result.

Prefer a reproducible Node script using a maintained SVG rasterizer already compatible with the project. Avoid heavyweight graphics dependencies without justification.

---

# 13. Marketing and social assets

Create optional editable templates:
- Social avatar: symbol only.
- Social banner: wordmark, tagline and route motif.
- App-store feature graphic concept.
- Presentation cover.
- Favicon set.

Keep marketing assets consistent with the app. Use “See the whole. Shape what matters.” as the primary campaign line. Do not claim features the app does not yet support.

---

# 14. Mock data

Use one coherent mock dataset only; it demonstrates the design and is not permanent product data. It lives only in the dev-only mock adapter behind the data-access ports, never in components (`docs/architecture/frontend.md` §6). The exact values Figma shows (sample date 12 Nov 2026, Destination 20 %, "Submit application" Waypoint 40 %, Step states and the blocked checklist dependency) are listed in `docs/design/figma-handoff.md` §6. The mock reproduces the backend's progress rule only to show the designs; real progress always comes from the backend.

Example Destination:
- Title: Complete an online Master's degree in Computer Science / AI.
- Dimension: Career.
- Waypoints (Figma V3): Submit application; Receive admission decision; Start studying; Complete foundational coursework; Complete elective coursework; Graduate. Thesis/capstone is excluded until programme requirements are confirmed.
- Steps: a few illustrative application and study actions.
- Application target: December 2026.
- Planned study start: Fall 2027.
- Graduation target: end of 2030.
- Reward: a personally meaningful graduation celebration.

Show one cross-goal Connection. Mark any financial impact as illustrative and unverified. Do not fabricate tuition, income, loan or investment values.

---

# 15. Interaction and state design

Every major component needs default, hover (where relevant), focus-visible, pressed, selected, disabled, loading, empty and error states as applicable.

Patterns:
- Primary button: green action fill (`--color-action-primary`) with the on-action label; hover and pressed use the action hover/pressed tokens (Figma `Atlas/V3/Button`, `152:2307`). *Superseded by Figma V3:* navy fill.
- Secondary button: transparent surface with the action border and text color.
- Focus: 2 px focus ring outside the control (violet, §2.1) on every interactive element.
- Tertiary action: text button.
- Destructive action: semantic destructive color and confirmation.
- Selected dimension: accent tint + border + icon + text.
- Progress: neutral track; fill uses dimension or status color.
- Badge: compact and readable, not excessively rounded.

Provide clear feedback after completing a Step, editing a Destination or creating a Waypoint. Avoid confirmation modals for low-risk actions. Confirm destructive deletion and explain downstream effects.

---

# 16. Design quality gates

Do not mark complete until the following are checked.

### Brand and assets
- [ ] All logo variants exist as editable SVG.
- [ ] Symbol recognizable at 16, 24, 32 and 48 px.
- [ ] Logo works on light/dark backgrounds.
- [ ] Monochrome version remains legible.
- [ ] App icon has no text and respects safe area.
- [ ] Raster exports are reproducible.
- [ ] No external image/font URLs required at runtime.

### Design system
- [ ] All brand colors tokenized.
- [ ] Seven dimension accents represented.
- [ ] Semantic status colors distinct from dimension colors.
- [ ] Typography documented.
- [ ] Spacing, radius, elevation and motion tokens exist.
- [ ] Components consume tokens, not hard-coded values.

### UX and responsive
- [ ] Eight pages specified for desktop, tablet and mobile.
- [ ] Desktop sidebar and mobile bottom navigation work.
- [ ] Complex graphs have list alternatives.
- [ ] Timeline detail progressively collapses at broad zoom.
- [ ] Big picture appears before details.
- [ ] Breadcrumb drill-down/back navigation is coherent.
- [ ] Empty/loading/error states implemented.

### Accessibility
- [ ] Keyboard navigation works.
- [ ] Focus visible.
- [ ] Icon-only controls have accessible names.
- [ ] Contrast checked.
- [ ] Status not conveyed by color alone.
- [ ] Reduced motion supported.
- [ ] Touch targets meet minimum.
- [ ] Charts/graphs have text alternatives.

### Platform
- [ ] Angular production build passes.
- [ ] Capacitor web build passes.
- [ ] iOS icon asset catalog valid.
- [ ] Android adaptive icon assets valid.
- [ ] App icon verified in simulator/emulator.
- [ ] Safe areas and keyboard behavior checked.

---

# 17. Sequential Copilot execution prompts

Do not skip phases or proceed with unresolved design decisions.

**Superseded for production work:** the phase order, gates and backlog IDs for building the app from the Figma V3 designs are in `docs/implementation/roadmap.md`. The prompts below are kept for history; where they conflict with the roadmap or with Figma V3 (palette, fonts, logo, icons), the roadmap and Figma win.

## Prompt 1 — Inspect and plan

> Read this design specification completely. Inspect the frontend repository and report Angular version, build tooling, styling approach, routing, component conventions, test setup, Capacitor version and native platform structure. Create `design/DESIGN_DECISIONS.md` and a phased implementation plan. Identify incompatible/unnecessary dependencies. Do not modify application code yet. Ask for approval before proceeding.

## Prompt 2 — Brand assets and tokens

> Implement Phase B. Create token JSON files, editable SVG logo variants, seven Life Dimension icons and asset export documentation. Follow the exact palette and logo constraints. Keep SVG sources editable, use `currentColor` where appropriate, and avoid raster content embedded in SVG. Add validation for SVG dimensions and generated icon exports. Do not build pages yet. Run checks and report results.

## Prompt 3 — Angular theme foundation

> Implement Phase C. Integrate design tokens into Angular global styles and establish typography, semantic surfaces, controls, focus states, responsive utilities and Capacitor safe-area handling. If Angular Material is installed, theme it through supported APIs so default theme colors do not leak into the product. Add a token showcase route if useful. Run lint, tests and production build.

## Prompt 4 — Responsive application shell

> Implement Phase D. Build desktop sidebar, top bar, tablet navigation and mobile bottom navigation. Use IKIGAI ATLAS brand assets and icon conventions. Add responsive behavior, safe areas, keyboard accessibility and route placeholders for all eight areas. Validate at 375 px, 768 px, 1024 px, 1440 px and 1920 px widths.

## Prompt 5 — Reusable components

> Implement Phase E. Build the shared component catalogue with typed inputs/outputs, loading/empty/error states, focus behavior and token-based styles. Keep business logic out of presentational components. Add unit tests for meaningful interactions and accessibility checks where available.

## Prompt 6 — Page templates

> Implement Phase F. Build My Atlas, Destinations, Waypoints, Steps, Connections, Journey Overview, Milestone Awards and Life Dimensions using one coherent mock dataset. Follow the page specifications. Show the big picture first and reveal details on drill-down. Provide mobile-friendly alternatives for complex graphs and timelines. Do not add backend integration or fabricate financial values.

## Prompt 7 — Platform and quality validation

> Implement Phase G. Validate design on web, iOS and Android Capacitor targets. Verify app icons, splash assets, safe areas, keyboard behavior, responsive layouts, contrast, keyboard navigation and reduced motion. Fix issues rather than merely documenting them. Run all available tests, lint and production builds.

## Prompt 8 — Handover

> Implement Phase H. Complete README, component catalogue, page specifications, accessibility checklist, responsive behavior and asset export instructions. Document design decisions, dependencies, licenses and limitations. Provide a concise report with files created, checks executed/results and remaining work.

---

# 18. Non-negotiable design principles

1. **Big picture first:** users understand overall direction before task detail.
2. **Progressive disclosure:** Destination → Waypoint → Step.
3. **One visual language:** all modules share the same design system.
4. **Color has meaning:** dimension accents identify life areas; semantic colors identify status; green marks actions and progress; gold highlights meaningful achievements only.
5. **Motivation through clarity:** progress, meaningful rewards and next steps—not pressure, streak manipulation or noisy gamification.
6. **Connections matter:** show cross-goal dependencies and impacts, but never present uncertain forecasts as facts.
7. **Mobile is first-class:** do not squeeze a desktop dashboard onto a phone.
8. **Accessible by design:** every visualization and interaction has an accessible alternative.
9. **Editable source assets:** SVG masters and tokens remain maintainable, not just screenshots.
10. **Consistency beats novelty:** prefer a few excellent reusable patterns over many unique visual treatments.

**The finished product should feel like a personal atlas: calm enough to think clearly, structured enough to act, and inspiring enough to keep moving.**
