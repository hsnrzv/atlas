# IKIGAI ATLAS — UI/UX Design System & Copilot Implementation Instructions

> **Purpose:** Source of truth for creating an implementation-ready, editable design package and Angular UI foundations.
>
> **Product promise:** See the whole. Shape what matters.
>
> **Design direction:** Premium editorial + modern cartography: a personal command center combining an elegant investment dashboard, a journey visualization platform, and a calm personal-development companion.

## 0. GitHub Copilot operating instructions

Act as a senior product designer, design-systems engineer, Angular architect, and accessibility specialist.

### Required workflow

1. Inspect the existing frontend repository before changing files. Identify Angular and Capacitor versions, build system, styling approach, routing, tests, and native iOS/Android structure.
2. Create a design implementation plan before coding. List files, dependencies, risks, platform considerations, and verification steps.
3. Do not overwrite working code or introduce a second design system without explaining why.
4. Implement in small phases. After each phase, run formatting, lint, tests, and build checks available in the repository.
5. Treat design tokens as the single source of truth. Do not scatter hard-coded brand colors, spacing, radii, shadows, or typography values.
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

Create a distinctive geometric compass/atlas symbol with seven connected waypoint nodes around a central point. The seven outer points represent the seven Life Dimensions; the center represents the person and their purpose.

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

Use the exact wordmark **IKIGAI ATLAS**. Use a clean geometric sans-serif. Retain editable text in the master SVG and document font dependencies; outline text only in derived exports if necessary.

---

# 2. Color system

## 2.1 Core brand palette

The interface uses warm ivory as the working surface, deep navy for structure, and muted gold for achievement.

| Token | Hex | Intended use |
|---|---|---|
| `brand-midnight-950` | `#101D32` | Primary navigation, dark hero surfaces |
| `brand-midnight-900` | `#14243A` | Main brand navy |
| `brand-midnight-800` | `#203650` | Dark elevated surfaces |
| `brand-midnight-700` | `#304A65` | Secondary dark surfaces |
| `brand-ivory-50` | `#FBF9F4` | App canvas |
| `brand-ivory-100` | `#F5F0E6` | Main warm ivory |
| `brand-ivory-200` | `#EAE2D4` | Borders and subtle surfaces |
| `brand-gold-700` | `#A77C43` | Accessible gold emphasis |
| `brand-gold-600` | `#B88D52` | Achievement accent |
| `brand-gold-500` | `#D5AD70` | Decorative gold / badges on dark |
| `brand-gold-200` | `#EBD9B9` | Gold tinted surfaces |
| `neutral-900` | `#252B33` | Primary body text |
| `neutral-700` | `#4D5661` | Secondary text |
| `neutral-500` | `#747E89` | Muted metadata; verify contrast |
| `neutral-300` | `#D4D8DC` | Borders |
| `neutral-200` | `#E5E7E8` | Dividers |
| `neutral-100` | `#F0F1F1` | Neutral subtle surface |
| `white` | `#FFFFFF` | Cards and overlays |

Default usage:
- Page canvas: `#FBF9F4`.
- Card surface: `#FFFFFF`.
- Sidebar/mobile navigation: `#14243A`.
- Main text: `#252B33`.
- Secondary text: `#4D5661`.
- Primary action: navy with white text.
- Borders: `#EAE2D4` or `#D4D8DC`.
- Gold is an accent, not a default text color. Never use pale gold for small text on ivory. For small gold text on light surfaces, use `#805B2F` or `#765329`.

## 2.2 Life Dimension accents

| Dimension | Accent | Darker text/icon | Tint background |
|---|---:|---:|---:|
| Career / Profession | `#759ECA` | `#426D9B` | `#EAF1F8` |
| Finance | `#D5AD70` | `#805B2F` | `#F6EFE3` |
| Health | `#91AD99` | `#52765B` | `#EDF3EE` |
| Love / Partnership | `#CA8A76` | `#965B4A` | `#F8EEEA` |
| Passion | `#A99ACB` | `#6F5C98` | `#F1EEF7` |
| Friendship | `#78AFAE` | `#3F7776` | `#EAF3F2` |
| Family | `#C5A66D` | `#80683E` | `#F5F0E5` |

Use dimension accents for icons, chart series, small labels, timeline markers and selected states. Use darker variants for text/small icons on light surfaces and tints for chips/panels. Finance and Family must remain distinguishable by icon, label and tint. Never communicate dimension identity by color alone.

## 2.3 Semantic status colors

| Meaning | Hex | Usage |
|---|---:|---|
| Success / achieved | `#4F8064` | Completed state |
| In progress | `#426D9B` | Active state |
| Upcoming | `#9A7A43` | Upcoming deadline |
| At risk | `#B56B45` | Needs attention |
| Blocked | `#A65353` | Blocked dependency |
| Neutral / not started | `#747E89` | Inactive state |

Pair each semantic color with text or an icon. Do not use red/green alone.

## 2.4 Dark theme

Dark theme is a later enhancement. Define semantic tokens for both themes from the beginning. Use navy variations, not pure black. Do not simply invert colors; verify contrast for every semantic role.

---

# 3. Typography

## 3.1 Font recommendation

Use **Inter** as the primary UI typeface (SIL Open Font License). Use **DM Serif Display** sparingly for editorial hero moments, major page statements and selected award titles. Never use the serif font for dense data, controls or small text.

Bundle font files locally for reliable offline/mobile rendering. Do not depend on third-party font CDNs at runtime. If font packaging is unsuitable, fall back to system sans-serif.

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-display: "DM Serif Display", Georgia, serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

## 3.2 Type scale

| Token | Desktop size / line-height | Mobile size / line-height | Weight |
|---|---|---|---|
| Display | 48 / 56 px | 36 / 42 px | 500–600 |
| H1 | 36 / 44 px | 30 / 38 px | 600 |
| H2 | 28 / 36 px | 24 / 32 px | 600 |
| H3 | 22 / 30 px | 20 / 28 px | 600 |
| H4 | 18 / 26 px | 18 / 26 px | 600 |
| Body large | 16 / 26 px | 16 / 24 px | 400 |
| Body | 14 / 22 px | 14 / 22 px | 400 |
| Label | 12 / 16 px | 12 / 16 px | 600 |
| Caption | 11 / 16 px | 11 / 16 px | 400 |
| Metric | 32 / 38 px | 28 / 34 px | 600 |

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

Shadows are restrained; prefer borders and surface contrast:
- Level 0: none.
- Level 1: `0 1px 2px rgba(16, 29, 50, 0.05)`.
- Level 2: `0 4px 12px rgba(16, 29, 50, 0.07)`.
- Level 3: `0 12px 32px rgba(16, 29, 50, 0.12)` for modal/popover only.

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

Use **Lucide** through an Angular-compatible package or a small internal icon wrapper. Verify package compatibility with the installed Angular version before adding it.

Conventions:
- Default stroke width: 1.75–2.
- Sizes: 16, 18, 20, 24 px.
- 24 px for primary navigation, 20 px for buttons/list rows, 16 px for inline metadata.
- Consistent outline family; do not mix unrelated filled and outline sets.
- Icon-only buttons require accessible names and tooltips where useful.
- Never use emoji as UI icons.

Suggested icon mapping (verify exact exports in the installed version and choose a valid Lucide equivalent if needed):

| Area | Suggested icon |
|---|---|
| My Atlas | `compass` |
| Destinations | `flag` |
| Waypoints | `map-pin` |
| Steps | `list-checks` |
| Connections | `network` |
| Journey Overview | `route` |
| Milestone Awards | `award` |
| Life Dimensions | `orbit` or `circle-dot` |
| Career | `briefcase-business` |
| Finance | `wallet` |
| Health | `heart-pulse` |
| Love | `heart` |
| Passion | `sparkles` |
| Friendship | `users` |
| Family | `house` |
| Add | `plus` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Notes | `notebook-pen` |
| Calendar | `calendar-days` |
| Filter | `sliders-horizontal` |
| Search | `search` |
| Settings | `settings` |
| Expand | `chevron-right` or `maximize-2` |
| Locked | `lock` |
| Completed | `check-circle-2` |
| Warning | `alert-triangle` |

Create a consistent seven-icon Life Dimension set. Prefer Lucide glyphs where suitable; custom SVGs are allowed if they form a more coherent family. Dimension SVGs must use a 24 × 24 viewBox, consistent stroke, `currentColor`, and no embedded color.

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

Place Settings, Profile and Help at the bottom, separated from primary navigation. Brand symbol and wordmark sit at the sidebar top. Active state: narrow gold indicator plus a slightly lighter navy surface, not a bright oversized highlight.

## 6.2 Desktop

- Fixed/sticky left sidebar.
- Top bar with page title/breadcrumb, global search, quick-add, notifications and profile.
- Main content on warm ivory canvas.
- Clear page header, primary content and optional secondary insight panel.
- Keep content readable on ultrawide screens.

## 6.3 Tablet

- Collapsible sidebar or compact rail.
- Preserve primary actions and page title.
- Convert multi-column layouts to one or two columns.
- Allow horizontal scrolling or a simplified list for dense timeline/graph views.

## 6.4 Mobile / Capacitor

- Compact top app bar and bottom navigation.
- At most five bottom-nav destinations: My Atlas, Destinations, Journey, Awards, More.
- More exposes Waypoints, Steps, Connections and Life Dimensions.
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
- Ivory canvas.
- Hero may use navy with subtle map-grid/route motif.
- Dimension cards use white surfaces, small accent icons and slim progress indicators.
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
- Use a maintained open-source timeline library or focused SVG/CSS component after checking accessibility and maintenance.
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
- Prefer standalone Angular components if compatible with repository version/conventions.
- Keep components presentational where possible; do not embed domain rules.
- Use typed inputs and outputs.
- Use `OnPush` or the current Angular-recommended approach.
- Use signals where supported and appropriate.
- Avoid unnecessary state-management dependencies in the mock phase.
- Keep global styles minimal; component styles consume tokens.
- Add Storybook only if already present or justified by maintenance needs.

---

# 9. Visualization conventions

Use the right tool for each visualization; do not force one library to solve every problem.

- Charts: consider Apache ECharts after checking current Angular compatibility and bundle size.
- Timeline: evaluate an open-source timeline library or focused SVG/CSS component. Avoid paid-only timeline features.
- Calendar: use an open-source standard calendar view; avoid premium-only timeline/resource features.
- Relationship graph: add a graph library only if interaction needs justify it. A list alternative is mandatory.
- Cartographic ornamentation: SVG and CSS.

Chart rules:
- Dimension accent colors for series.
- Navy/neutral axes and labels.
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

JSON tokens are canonical. Generate or maintain CSS custom properties from those tokens; avoid divergent manual copies.

Required token groups:
- Primitive palette, semantic colors, dimension accents and status colors.
- Font families, sizes, weights, line heights and letter spacing.
- Spacing, radius, elevation and motion.
- Breakpoints, layout dimensions and z-index layers.

## 10.2 CSS foundation example

Implement the complete token set, not just this abbreviated example:

```css
:root {
  color-scheme: light;

  --color-brand-midnight-950: #101D32;
  --color-brand-midnight-900: #14243A;
  --color-brand-midnight-800: #203650;
  --color-brand-ivory-50: #FBF9F4;
  --color-brand-ivory-100: #F5F0E6;
  --color-brand-ivory-200: #EAE2D4;
  --color-brand-gold-600: #B88D52;
  --color-brand-gold-500: #D5AD70;

  --color-text-primary: #252B33;
  --color-text-secondary: #4D5661;
  --color-text-muted: #747E89;
  --color-surface-page: #FBF9F4;
  --color-surface-card: #FFFFFF;
  --color-border-subtle: #EAE2D4;

  --color-dimension-career: #759ECA;
  --color-dimension-finance: #D5AD70;
  --color-dimension-health: #91AD99;
  --color-dimension-love: #CA8A76;
  --color-dimension-passion: #A99ACB;
  --color-dimension-friendship: #78AFAE;
  --color-dimension-family: #C5A66D;

  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "DM Serif Display", Georgia, serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --shadow-1: 0 1px 2px rgba(16, 29, 50, 0.05);
  --shadow-2: 0 4px 12px rgba(16, 29, 50, 0.07);
  --shadow-3: 0 12px 32px rgba(16, 29, 50, 0.12);

  --layout-sidebar-expanded: 248px;
  --layout-sidebar-collapsed: 76px;
  --layout-topbar-height: 68px;
  --layout-content-max: 1440px;
}
```

## 10.3 Angular integration

- Use global `styles.scss` for reset/base typography, font declarations, tokens, theme setup and minimal global utilities.
- Use component SCSS for local layout.
- If Angular Material exists, theme through supported APIs. Prevent default purple/indigo colors from leaking into the app.
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
- Opaque midnight navy `#14243A` background unless a platform asset specifically requires otherwise.
- Central compass/waypoint mark in warm ivory and muted gold.
- Strong silhouette; no text.
- Generous safe area.
- No tiny lines, fine text or details that disappear at small sizes.

Generate derived assets:
- iOS App Store marketing icon: 1024 × 1024 PNG, RGB, no transparency.
- Android adaptive icon foreground/background per current Android guidance.
- Android legacy density assets if required by the generated project.
- Google Play listing icon: 512 × 512 PNG.
- Splash artwork with centered symbol and solid brand background.

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

Use one coherent mock dataset only; it demonstrates the design and is not permanent product data.

Example Destination:
- Title: Complete an online Master's degree in Computer Science / AI.
- Dimension: Career.
- Waypoints: Prepare application; receive admission; begin studies; complete foundational courses; complete electives; complete thesis if required; graduate.
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
- Primary button: navy fill, white/ivory label.
- Secondary button: transparent/ivory surface with navy border/text.
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
4. **Color has meaning:** dimension accents identify life areas; semantic colors identify status; gold highlights meaningful achievements.
5. **Motivation through clarity:** progress, meaningful rewards and next steps—not pressure, streak manipulation or noisy gamification.
6. **Connections matter:** show cross-goal dependencies and impacts, but never present uncertain forecasts as facts.
7. **Mobile is first-class:** do not squeeze a desktop dashboard onto a phone.
8. **Accessible by design:** every visualization and interaction has an accessible alternative.
9. **Editable source assets:** SVG masters and tokens remain maintainable, not just screenshots.
10. **Consistency beats novelty:** prefer a few excellent reusable patterns over many unique visual treatments.

**The finished product should feel like a personal atlas: calm enough to think clearly, structured enough to act, and inspiring enough to keep moving.**
