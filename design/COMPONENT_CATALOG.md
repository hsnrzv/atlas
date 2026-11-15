# Component catalogue

There are two parts:

- [Implemented primitives](#implemented-primitives), from design steps 1–3. These exist in `src/app/shared/` and
  `src/styles/`.
- The [planned catalogue](#planned-catalogue-design-step-5), from design-instructions §8. Nothing in that part exists
  yet; its selectors and APIs are **proposals** for design step 5.

All components follow ADR-0003:

- Standalone components with the `atlas-` selector prefix (enforced by angular-eslint).
- Angular 22 defaults: OnPush and zoneless.
- Signal `input()` and `output()`.
- Tokens only; Stylelint forbids hex colours under `src/app`.
- No `::ng-deep`.

Class names follow the Angular style guide used in the repo, without a `Component` suffix (`AtlasIcon`, not
`AtlasIconComponent`). The spec's `XxxComponent` names map onto these classes.

## Implemented primitives

### atlas-icon

`src/app/shared/icons/atlas-icon.ts` wraps `<tabler-icon>` from `@tabler/icons-angular` 3.51. The choice of library is
recorded in [DD-05](DESIGN_DECISIONS.md#dd-05-tabler-icons-instead-of-lucide) and
[ADR-0005](../docs/adr/0005-icon-library-tabler.md); the Figma V3 stroke and glyphs are in
[DD-34](DESIGN_DECISIONS.md#dd-34-figma-v3-tokens-typography-icons-and-brand-phase-2).

| Input    | Type                           | Default | Notes                                                                                                    |
| -------- | ------------------------------ | ------- | -------------------------------------------------------------------------------------------------------- |
| `name`   | `AtlasIconName` (required)     | —       | A semantic name from `ATLAS_ICONS`. It is never a Tabler name.                                           |
| `size`   | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'`  | 16 / 18 / 20 / 24 px (`ATLAS_ICON_SIZES`, which mirrors `--size-icon-*`)                                 |
| `stroke` | `number`                       | `2`     | `ATLAS_ICON_STROKE`, which mirrors `--size-icon-stroke`                                                  |
| `label`  | `string`                       | none    | Without a label the icon is `aria-hidden="true"`. With a label it gets `role="img"` and an `aria-label`. |

- Colour follows `currentColor`.
- The host has the class `atlas-icon` and uses `inline-flex` with `line-height: 0`.

The registry (`src/app/shared/icons/atlas-icons.ts`, `ATLAS_ICONS`) maps semantic names to Tabler icons:

| Group           | Semantic names → Tabler icon                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation      | `my-atlas` compass · `destinations` flag · `waypoints` map-pin · `steps` list-check · `connections` sitemap · `journey-overview` route · `milestone-awards` award · `life-dimensions` orbit                                                                                                                                                                                                                                                                                                                                                  |
| Life Dimensions | `career` briefcase · `finance` wallet · `health` heartbeat · `love` heart · `passion` sparkles · `friendship` users · `family` home                                                                                                                                                                                                                                                                                                                                                                                                          |
| Actions         | `add` plus · `edit` pencil · `delete` trash · `notes` notebook · `calendar` calendar-week · `filter` adjustments-horizontal · `search` · `settings` · `profile` user · `help` · `notifications` bell · `next` arrow-right · `check` · `alert` alert-circle · `loading` loader-2 · `expand` chevron-right · `collapse` chevron-down · `back` arrow-left · `close` x · `menu` menu-2 · `more` dots · `locked` lock · `sidebar-collapse` / `sidebar-expand` layout-sidebar-left-collapse / -expand · `view-grid` layout-grid · `view-list` list |
| Status          | `status-success` check · `status-in-progress` loader-2 · `status-upcoming` calendar-week · `status-at-risk` alert-circle · `status-blocked` lock · `status-not-started` flag                                                                                                                                                                                                                                                                                                                                                                 |

To add an icon, see [README › Add or change an icon](README.md#add-or-change-an-icon). Unit tests are in
`atlas-icon.spec.ts`.

```html
<atlas-icon name="destinations" size="lg" />
<!-- decorative: next to visible text -->
<button type="button" aria-label="Add Step"><atlas-icon name="add" /></button>
<!-- the button carries the name -->
<atlas-icon name="status-blocked" label="Blocked" />
<!-- standalone meaning -->
```

### atlas-logo

`src/app/shared/brand/atlas-logo.ts` (+ `.scss`). The symbol is inline SVG and the wordmark is live text. See
[DD-24](DESIGN_DECISIONS.md#dd-24-the-in-app-logo-renders-live-text) and
[BRAND_GUIDELINES.md](BRAND_GUIDELINES.md).

| Input        | Type                       | Default        | Notes                                                                                                                                        |
| ------------ | -------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`    | `'symbol' \| 'horizontal'` | `'horizontal'` | `horizontal` adds the "IKIGAI ATLAS" wordmark (Manrope 700, 22/48 of the symbol height, 1 px tracking at 22 px).                             |
| `size`       | `number`                   | `32`           | Symbol height in px, set as `--atlas-logo-size`. The minimum is 24 in UI ([minimum sizes](BRAND_GUIDELINES.md#minimum-sizes)).               |
| `decorative` | `boolean`                  | `false`        | `false` gives `role="img"` and `aria-label="IKIGAI ATLAS"`. `true` gives `aria-hidden`; use it when adjacent text already names the product. |

- In `forced-colors` mode the circles become `CanvasText` outlines.
- Geometry is shared with `design/svg/logo/ikigai-atlas-symbol.svg`: four r 19.2 circles (Figma V3 Venn). Colours come
  from the `--color-brand-venn-*` tokens. The blend follows the theme: `multiply` (72 %) in light and `screen` (82 %)
  under `[data-theme='dark']`. The wordmark uses `--color-text-primary`. There is no `tone` input.
- Tests are in `atlas-logo.spec.ts`.

### AtlasTheme (service)

`src/app/shared/design-system/atlas-theme.ts`, `providedIn: 'root'`.

| Member     | Type                                | Notes                                                                             |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `mode`     | `WritableSignal<'light' \| 'dark'>` | Defaults to `'light'`. An effect sets or removes `data-theme="dark"` on `<html>`. |
| `toggle()` | `void`                              | Switches the mode. Used only by the design-foundation page.                       |

The preference is not persisted and is not offered to users yet
([DD-13](DESIGN_DECISIONS.md#dd-13-dark-theme-is-a-preview-not-a-user-setting)).

### LIFE_DIMENSIONS

`src/app/shared/design-system/life-dimensions.ts`. It is built from the generated `LIFE_DIMENSION_KEYS` and
`lifeDimensionMeta`, which come from `design/tokens/design-tokens.json → lifeDimensions`.

| Field                        | Example (Career)                                                     |
| ---------------------------- | -------------------------------------------------------------------- |
| `key`                        | `'career'` (token and icon key, lowercase)                           |
| `apiKey`                     | `'CAREER'` (backend enum)                                            |
| `label` / `longLabel`        | from `lifeDimensionMeta`                                             |
| `icon`                       | `'career'` (`AtlasIconName`)                                         |
| `color.foreground` / `.tint` | `var(--color-dimension-career)` / `…-tint`, so they follow the theme |

- The array is in canonical order: Career, Finance, Health, Love, Passion, Friendship, Family.
- `lifeDimensionByApiKey(apiKey)` returns the dimension or `undefined`.
- `foreground` is for text, icons, strokes and chart series; it passes 4.5:1 on its tint in both themes.
  `--color-dimension-<key>-strong` is still emitted as an alias for one release; do not use it in new code.
- Always show a label.

### ATLAS_STATUSES

`src/app/shared/design-system/statuses.ts`.

| Key           | Label       | Icon                 | Colour / tint                                            |
| ------------- | ----------- | -------------------- | -------------------------------------------------------- |
| `success`     | Completed   | `status-success`     | `var(--color-status-success)` / `…-success-tint`         |
| `in-progress` | In progress | `status-in-progress` | `var(--color-status-in-progress)` / `…-in-progress-tint` |
| `upcoming`    | Upcoming    | `status-upcoming`    | `var(--color-status-upcoming)` / `…-upcoming-tint`       |
| `at-risk`     | At risk     | `status-at-risk`     | `var(--color-status-at-risk)` / `…-at-risk-tint`         |
| `blocked`     | Blocked     | `status-blocked`     | `var(--color-status-blocked)` / `…-blocked-tint`         |
| `not-started` | Not started | `status-not-started` | `var(--color-status-not-started)` / `…-not-started-tint` |

- Both tokens are theme-aware. The foreground colours the icon and the badge label on the tint (≥ 4.5:1 in both
  themes). Always render the label; colour is never the only signal
  ([DD-08](DESIGN_DECISIONS.md#dd-08-status-is-never-conveyed-by-colour-alone)).
- **Open mapping (to decide in step 5):** the domain node statuses are `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`,
  `SKIPPED` and `CANCELLED`, but the UI statuses add the derived `upcoming`, `at-risk` and `blocked` and have no
  skipped or cancelled presentation. A `statusForNode()` adapter, unit-tested, should own this mapping (PLAN-FRONTEND D14 has the proposed default).

### Generated token constants

`src/app/shared/design-system/tokens.generated.ts` is generated by `npm run tokens:build`. Do not edit it.

| Export                                    | Content                                                                                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LIFE_DIMENSION_KEYS`, `LifeDimensionKey` | The seven keys in canonical order                                                                                                                        |
| `lifeDimensionMeta`                       | apiKey, label, longLabel (e.g. "Career / Profession") and the Tabler icon name (e.g. `briefcase`) per dimension                                          |
| `colorPrimitives`, `semanticColors`       | Raw values for non-CSS consumers, such as chart options; `semanticColors` has `light` and `dark` (incl. dimensions). Use the CSS variables in templates. |
| `statusColors`                            | Light-theme status foreground and tint                                                                                                                   |
| `breakpoints`                             | `{ xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }`                                                                                           |
| `durations`, `easings`                    | Motion values in ms, for animations driven from TypeScript                                                                                               |

### Sass abstracts and global classes

Import the abstracts with `@use 'abstracts' as atlas;`. The include path is configured in `angular.json`.

| API                                                                          | Purpose                                                                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `atlas.up($bp)`, `atlas.down($bp)`, `atlas.between($a, $b)`, `atlas.bp($bp)` | Breakpoint media queries ([RESPONSIVE_BEHAVIOR.md](RESPONSIVE_BEHAVIOR.md#sass-usage-mobile-first))                                              |
| `atlas.style($name)`                                                         | Applies a type style (`display`, `h1`–`h4`, `body-large`, `body`, `label`, `control`, `caption`, `metric`). It adds tabular numerals for metric. |
| `atlas.tabular-numbers`, `atlas.truncate`                                    | Numeric alignment, and single-line ellipsis                                                                                                      |
| `atlas.focus-ring($color)`                                                   | A 2 px outline with a 2 px offset. The default colour is `--color-focus-ring`.                                                                   |
| `atlas.visually-hidden`                                                      | Hides content visually but keeps it available to screen readers                                                                                  |
| `atlas.touch-target`                                                         | Minimum 44 × 44 px hit area                                                                                                                      |

Global classes (from `src/styles/base`):

- type: `.atlas-display`, `.atlas-h1` … `.atlas-h4`, `.atlas-body-large`, `.atlas-body`, `.atlas-label`,
  `.atlas-control`, `.atlas-caption`, `.atlas-metric`;
- `.atlas-tabular`, `.atlas-text-secondary`, `.atlas-text-muted`;
- `.atlas-visually-hidden` and `.atlas-skip-link`.

### Angular Material theme

`src/styles/material/_theme.scss` ([DD-16](DESIGN_DECISIONS.md#dd-16-angular-material-m3-mapped-onto-atlas-tokens)):

- `mat.theme` (M3, density 0) uses palettes from `_theme-colors.scss`. M3 system roles are then overridden with Atlas
  CSS variables:
  - primary maps to `--color-action-primary`;
  - containers map to the subtle and achievement surfaces;
  - the inverse roles map to the raised surface, because V3 has no inverse surface;
  - surfaces map to card and page;
  - outlines map to the border tokens;
  - error maps to destructive.
- Buttons use `--radius-sm` and `--size-control-height` (48 px), cards `--radius-md` and dialogs `--radius-lg`.
- `mat.strong-focus-indicators` draws a 2 px solid indicator with a 4 px radius.
- Dark is applied under `html[data-theme='dark']`.
- `prefers-contrast: more` applies the high-contrast overrides in light mode.
- The design-foundation page verifies these Material modules: button, card, form field, input and slide toggle.
  Others, such as dialog, menu, tabs, snackbar, tooltip, chips and progress, are themed by the same system tokens, but
  their visual check is **pending**, in step 5.

## Planned catalogue (design step 5)

**Status: Specified.** These are proposals only. Rules from design-instructions §8:

- Components are presentational and take typed view models. They emit intents through outputs and contain no domain
  rules.
- Signals are used where they help. No state-management library is added in the mock phase.
- Component styles consume tokens. Storybook is not added: the design-foundation page and its future successor act as
  the living reference.

Every component covers the states in §15 that apply: default, hover, focus-visible, pressed, selected, disabled,
loading, empty and error.

Shared patterns from §15:

- Buttons follow Figma `Atlas/V3/Button` (`152:2307`): 48 px high (`--size-control-height`), radius 8, `control` text
  style (Inter 600 14/22). Disabled buttons use `--color-action-disabled` with `--color-action-on-disabled`.
- Primary button: filled `--color-action-primary` with a `--color-action-on-primary` label.
- Secondary button: outlined, with a `--color-text-primary` label on a `--color-border-control` outline.
- Tertiary action: text button with a `--color-text-primary` label.
- Destructive action: destructive colour plus confirmation.
- Selected dimension: tint + border + icon + text.
- Progress: a neutral track, with a dimension or status fill.
- Badges use `--radius-sm`. Only tags and filters use `--radius-pill`.

### Shell and navigation

| Spec name / proposed selector                           | Inputs → outputs                                                                      | States and accessibility                                                                                                                                                                                             | Tokens                                                                                                | Built on                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `AppShellComponent` → `atlas-app-shell`                 | `navItems`, `user`; content projection → `quickAdd`                                   | Landmarks: `header`, `nav` (labelled "Primary"), `main#main`. The skip link is the first focus stop. Switches layout at `md` and `lg`.                                                                               | `--layout-*`, `--safe-area-*`, `--z-navigation`, `--z-topbar`                                         | CDK `BreakpointObserver`, router outlet    |
| `DesktopSidebarComponent` → `atlas-sidebar`             | `items`, `activeRoute`, `collapsed` (model)                                           | `aria-current="page"` on the active item. The collapse button has an accessible name. Collapsed items keep their names and show tooltips. The active item uses the nav-active surface (dark adds a teal accent bar). | `--color-surface-navigation`, `--color-nav-active`, `--color-nav-active-accent`, `--layout-sidebar-*` | `routerLink`, `MatTooltip`                 |
| `MobileBottomNavigationComponent` → `atlas-bottom-nav`  | `items` (at most 5), `activeRoute` → `more`                                           | Icons always have text labels. Targets ≥ 48 px. Pads by `--safe-area-bottom`. More opens a sheet.                                                                                                                    | `--layout-bottom-nav-height`, `--size-touch-target-preferred`                                         | `routerLink`, `MatBottomSheet`             |
| `TopBarComponent` → `atlas-top-bar`                     | `title`, `breadcrumbs`, `showBack` → `search`, `quickAdd`, `notifications`, `profile` | Icon-only buttons have `aria-label`. Compact under `md`. Pads by `--safe-area-top`.                                                                                                                                  | `--layout-topbar-height(-compact)`, `--z-topbar`                                                      | `MatToolbar` (optional), `MatMenu`         |
| `PageHeaderComponent` → `atlas-page-header`             | `title`, `subtitle`, `dimension?`, `status?`; projected actions                       | Exactly one `h1` per page. Actions stay visible on mobile, with overflow into a menu.                                                                                                                                | `atlas.style(h1)`, `--space-*`                                                                        | —                                          |
| `BreadcrumbsComponent` → `atlas-breadcrumbs`            | `items: {label, link}[]`                                                              | `nav` labelled "Breadcrumb" with an ordered list. The last item has `aria-current="page"`. On mobile it collapses to the parent plus a back link.                                                                    | `--color-text-secondary`, `--color-text-primary` with a `--color-border-action` underline             | `routerLink`                               |
| `ResponsiveDrawerComponent` → `atlas-responsive-drawer` | `open` (model), `position` → `closed`                                                 | A side panel at `lg` and above; a modal sheet below. Focus trap and restore. Esc closes it.                                                                                                                          | `--z-drawer`, `--shadow-3`, `--duration-standard`                                                     | `MatSidenav` / CDK `Overlay` + `FocusTrap` |

### Indicators and data display

| Spec name / proposed selector                       | Inputs → outputs                                                                                                                     | States and accessibility                                                                                                                                                    | Tokens                                                           | Built on                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `DimensionBadgeComponent` → `atlas-dimension-badge` | `dimension: LifeDimensionKey`, `size`, `selected`                                                                                    | Icon + label are always shown. When selected: tint + border + icon + text. Never colour-only.                                                                               | `--color-dimension-*` (strong, tint), `--radius-sm`              | `atlas-icon`, `LIFE_DIMENSIONS` |
| `StatusBadgeComponent` → `atlas-status-badge`       | `status: AtlasStatusKey`, `compact`                                                                                                  | The icon is coloured and the label is in text-secondary. In compact mode the label is visually hidden but still read out.                                                   | `--color-status-*`, `--color-text-secondary`                     | `ATLAS_STATUSES`                |
| `ProgressIndicatorComponent` → `atlas-progress`     | `value` (0–100), `label`, `dimension?`, `status?`, `variant: 'bar' \| 'ring'`                                                        | `role="progressbar"` with `aria-valuenow`, min and max, and `aria-label` or `aria-labelledby`. The percentage is also shown as text.                                        | `--size-progress-track`, neutral track, dimension or status fill | native, or `MatProgressBar`     |
| `MetricCardComponent` → `atlas-metric-card`         | `label`, `value`, `unit`, `trend?`, `dimension?`                                                                                     | The number uses tabular numerals. The unit is always present. A trend has a text equivalent.                                                                                | `atlas.style(metric)`, `--color-surface-card`, `--shadow-1`      | `MatCard` (optional)            |
| `DateLabelComponent` → `atlas-date-label`           | `date`, `precision: 'DAY' \| 'MONTH' \| 'QUARTER' \| 'YEAR' \| 'APPROXIMATE'` (API `PlannedDate`; no season in the MVP), `relative?` | Renders `<time datetime>`. It never invents precision: Dec 2026 stays "Dec 2026" (project-instruction §10.5). Relative text such as "in 3 weeks" also has an absolute form. | `--color-text-secondary`                                         | `Intl.DateTimeFormat`           |

### Domain cards and lists

| Spec name / proposed selector                           | Inputs → outputs                                       | States and accessibility                                                                                                                                    | Tokens                                                                                | Built on                        |
| ------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| `DestinationCardComponent` → `atlas-destination-card`   | `destination: DestinationCardVm` → `open`              | The whole card is one link, with the heading as its name. It shows the dimension badge, status, progress, next Waypoint and target date. Hover is optional. | `--color-surface-card`, `--radius-md`, `--shadow-1`                                   | `MatCard`, `routerLink`         |
| `WaypointTimelineComponent` → `atlas-waypoint-timeline` | `waypoints: WaypointVm[]`, `orientation` → `select`    | An ordered list (`ol`) is the primary semantics. Each node is a focusable link. Vertical on mobile, horizontal at `lg` and above.                           | route line `--color-border-subtle`, `--color-border-action` for the current Waypoint  | SVG/CSS (ADR-0004 §4)           |
| `WaypointNodeComponent` → `atlas-waypoint-node`         | `waypoint`, `state: 'done' \| 'current' \| 'upcoming'` | The state is expressed by icon + label, never only by colour or shape. The accessible name includes the date and status.                                    | status tokens                                                                         | `atlas-icon`                    |
| `StepListComponent` → `atlas-step-list`                 | `steps: StepVm[]`, `groupBy?` → `toggle`, `open`       | A list of rows. Completing a Step announces feedback through a live region or snackbar (§15). The empty state has a call to action.                         | `--space-*`, `--color-border-subtle`                                                  | CDK `ListKeyManager` (optional) |
| `StepRowComponent` → `atlas-step-row`                   | `step: StepVm` → `toggle`, `open`                      | A native checkbox with the Step title as its label, plus a separate link for the details. Targets ≥ 44 px.                                                  | `--size-touch-target-min`                                                             | `MatCheckbox`                   |
| `AwardCardComponent` → `atlas-award-card`               | `award: AwardVm` (PLANNED, EARNED or REDEEMED)         | The state is shown as text. When earned the card uses the achievement surface. Gold appears only here (§2).                                                 | `--color-surface-achievement`, `--color-text-achievement`, `gold.dark` / `gold.light` | `MatCard`                       |
| `NotesPanelComponent` → `atlas-notes-panel`             | `notes`, `editable` → `save`                           | A labelled textarea. Save state is announced. Text width is limited to `--layout-reading-max`.                                                              | `--layout-reading-max`                                                                | `MatFormField`, `MatInput`      |

### Visualisation wrappers (ADR-0004; libraries not installed)

| Spec name / proposed selector                         | Inputs → outputs                                                                              | Accessibility                                                                                                                                                                   | Built on                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `ConnectionGraphComponent` → `atlas-connection-graph` | `nodes`, `links` (type: SUPPORTS, DEPENDS_ON, CONFLICTS_WITH, AFFECTS, RELATED_TO) → `select` | Has a text summary. It is **always** paired with `atlas-connection-list`. Link types are shown by a label or line style, not only by colour. The graph may be hidden on mobile. | ECharts `graph` series via `ngx-echarts` (proposed) |
| `ConnectionListComponent` → `atlas-connection-list`   | `connections: ConnectionVm[]` → `open`                                                        | A table or list in the form "From — type — To". This is the primary alternative and the default view on mobile.                                                                 | native table, or `MatTable`                         |
| `JourneyTimelineComponent` → `atlas-journey-timeline` | `items`, `range`, `zoom` → `select`, `rangeChange`                                            | Detail collapses progressively at broad zoom (§16). Keyboard pan and zoom. A list alternative grouped by period. Reduced motion is respected.                                   | Phase 5 spike: `vis-timeline` vs. SVG/CSS           |

### Feedback and states

| Spec name / proposed selector                           | Inputs → outputs                                                   | Accessibility                                                                                                                                               | Built on                    |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `EmptyStateComponent` → `atlas-empty-state`             | `title`, `message`, `icon` → `action`                              | Encouraging copy with one clear primary action. The icon is decorative.                                                                                     | —                           |
| `LoadingSkeletonComponent` → `atlas-loading-skeleton`   | `shape`, `lines`                                                   | The container has `aria-busy="true"`. The skeleton is `aria-hidden`, with one visually hidden "Loading…" message. There is no shimmer under reduced motion. | CSS                         |
| `ErrorStateComponent` → `atlas-error-state`             | `title`, `message`, `retryable` → `retry`                          | Uses `role="alert"` only for errors that appear after load. Plain-language cause plus a retry action.                                                       | —                           |
| `ConfirmDialogComponent` → `atlas-confirm-dialog`       | data `{ title, consequences, confirmLabel, destructive }` → result | Labelled by its title. Focus starts on the safe action. Explains downstream effects (§15). Only for destructive actions.                                    | `MatDialog` (`--radius-lg`) |
| `Toast/NotificationComponent` → `atlas-toast` (service) | `message`, `action?`, `politeness`                                 | Polite live region. Toasts carrying an action do not auto-dismiss below 10 s (to verify against WCAG 2.2.1). Positioned clear of the bottom navigation.     | `MatSnackBar`, `--z-toast`  |

### Input and actions

| Spec name / proposed selector                    | Inputs → outputs                                            | Accessibility                                                                                                                   | Built on                          |
| ------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `FilterBarComponent` → `atlas-filter-bar`        | `dimensions`, `statuses`, `value` (model) → `valueChange`   | Chip group with selected state and checkmarks. The number of results is announced. On mobile the filters collapse into a sheet. | `MatChipListbox`, `--radius-pill` |
| `SearchFieldComponent` → `atlas-search-field`    | `placeholder`, `value` (model) → `search`                   | `type="search"` inside `role="search"`, with a visible or visually hidden label. The clear button has a name.                   | `MatFormField`, `MatInput`        |
| `QuickAddMenuComponent` → `atlas-quick-add-menu` | `options` → `create('destination' \| 'waypoint' \| 'step')` | The menu button has an accessible name. Arrow-key navigation comes from `MatMenu`. Each item uses a UI-vocabulary label.        | `MatMenu`                         |

## Open questions for step 5

- How node status maps to `ATLAS_STATUSES`; see above.
- Whether `atlas-toast` wraps `MatSnackBar` or uses a custom CDK overlay. The CDK overlay container already uses `--z-overlay`
  ([DD-32](DESIGN_DECISIONS.md#dd-32-cdk-overlay-container-uses-the-overlay-layer)).
- Whether to replace the design-foundation page with a permanent `/design-system` reference route, kept out of
  production navigation.
