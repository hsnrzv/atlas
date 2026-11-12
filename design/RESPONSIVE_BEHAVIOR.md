# Responsive behaviour

Breakpoints, layout tokens and safe-area variables are **Implemented** (design steps 2–3). The application shell is
**Specified** for design step 4 and is not built yet. Until then the only route is the temporary design-foundation page.
The wireframes [`mockups/app-shell-desktop.svg`](mockups/app-shell-desktop.svg) and
[`mockups/app-shell-mobile.svg`](mockups/app-shell-mobile.svg) illustrate the target.

## Breakpoints

The source is `design/tokens/layout.json` (design-instructions §10.4). Breakpoints are **min-widths**, applied
mobile-first.

| Name  | Min width | Range        | Typical device class |
| ----- | --------- | ------------ | -------------------- |
| `xs`  | 0         | 0–479 px     | Small phones         |
| `sm`  | 480 px    | 480–767 px   | Large phones         |
| `md`  | 768 px    | 768–1023 px  | Tablet               |
| `lg`  | 1024 px   | 1024–1279 px | Narrow desktop       |
| `xl`  | 1280 px   | 1280–1535 px | Desktop              |
| `2xl` | 1536 px   | ≥ 1536 px    | Wide and ultrawide   |

The generated outputs are:

- the Sass map `$breakpoints` in `src/styles/tokens/_breakpoints.generated.scss`;
- the TypeScript constant `breakpoints` in `tokens.generated.ts`, for example for CDK `BreakpointObserver`;
- the CSS variables `--breakpoint-*`, which are informational only, because custom properties cannot be used inside
  media queries.

Device classes are only a guide. Add a content-driven breakpoint where a layout actually breaks (§10.4).

## Layout tokens

| Token (CSS variable)                     | Value                                          | Use                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `--layout-content-max`                   | 1440                                           | Maximum content width. Extra space on ultrawide becomes margin.                                                                 |
| `--layout-reading-max`                   | 840                                            | Long-form detail text (notes, descriptions)                                                                                     |
| `--layout-sidebar-expanded`              | 248                                            | Desktop sidebar                                                                                                                 |
| `--layout-sidebar-collapsed`             | 76                                             | Collapsed sidebar and tablet rail                                                                                               |
| `--layout-topbar-height`                 | 68                                             | Desktop top bar                                                                                                                 |
| `--layout-topbar-height-compact`         | 56                                             | Compact and mobile top bar (plus `--safe-area-top`)                                                                             |
| `--layout-bottom-nav-height`             | 64                                             | Mobile bottom navigation (plus `--safe-area-bottom`)                                                                            |
| `--layout-gutter-mobile`                 | 16                                             | Horizontal page padding below `md`                                                                                              |
| `--layout-gutter-tablet`                 | 24                                             | `md`                                                                                                                            |
| `--layout-gutter-desktop-narrow`         | 24                                             | `lg`                                                                                                                            |
| `--layout-gutter-desktop`                | 32                                             | `xl` and up                                                                                                                     |
| `--layout-columns-mobile/tablet/desktop` | 4 / 8 / 12                                     | Grid columns, applied "when appropriate" (§4.1)                                                                                 |
| `--space-*`                              | 4 px base: `--space-1` = 4 … `--space-20` = 80 | Grid gaps and component spacing                                                                                                 |
| `--z-*`                                  | 0 … 900                                        | Stacking order: sticky 100, navigation 200, topbar 300, drawer 400, overlay 500, modal 600, popover 700, toast 800, tooltip 900 |
| `--size-touch-target-min/preferred`      | 44 / 48                                        | Interactive targets                                                                                                             |

All values are in px. Values come from design-instructions §4.1, except `bottom-nav-height` and the z-index scale,
which are Atlas additions ([DD-22](DESIGN_DECISIONS.md#dd-22-layout-token-additions)).

## Shell behaviour per breakpoint (Specified, step 4)

| Range               | Navigation                                                                                                                                                                                                                   | Top bar                                                                                                                       | Content                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xs`–`sm` (< 768)   | **Bottom navigation**, navy, 64 px plus the bottom safe area. Items: My Atlas, Destinations, Journey, Awards, More. More opens a sheet with Waypoints, Steps, Connections, Life Dimensions, then Settings, Profile and Help. | Compact, 56 px plus the top safe area. Shows the symbol or a back button, the page title, then search, quick add and profile. | One column, 16 px gutters, 4-column grid. Big picture first: the next Waypoint comes before analytics. Carousels for dimension cards. List alternatives for graphs and timelines. |
| `md` (768–1023)     | **Compact rail** (76 px, icons with tooltips and accessible names). It can expand to 248 px as an overlay drawer (`--z-drawer`). No bottom navigation.                                                                       | 68 px (to verify during step 4; 56 is the alternative). Title or breadcrumb, search, quick add, profile.                      | One or two columns, 24 px gutters, 8-column grid. Dense timelines and graphs scroll horizontally or switch to a list.                                                             |
| `lg` (1024–1279)    | **Sidebar**, 248 px, sticky, collapsible to 76 px.                                                                                                                                                                           | 68 px. Breadcrumb, global search, quick add, notifications, profile.                                                          | 12 columns, 24 px gutters. An optional secondary insight panel stacks below the main content.                                                                                     |
| `xl`–`2xl` (≥ 1280) | Sidebar, 248 px.                                                                                                                                                                                                             | 68 px.                                                                                                                        | 12 columns, 32 px gutters, content max 1440 px. Optional right-hand insight panel. Detail text max 840 px.                                                                        |

The sidebar contents follow design-instructions §6.1:

- At the top: the symbol and the "IKIGAI ATLAS" wordmark (`<atlas-logo tone="inverse">`).
- Then the eight primary items in the fixed order My Atlas, Destinations, Waypoints, Steps, Connections, Journey
  Overview, Milestone Awards, Life Dimensions.
- At the bottom, separated from the primary items: Settings, Profile and Help.
- The active state is a narrow gold indicator (`--color-nav-indicator`) on a lighter navy surface (midnight-800).

Navigation behaviour (§6.5):

- Breadcrumbs follow the drill-down Destination → Waypoint → Step.
- On mobile, a back affordance and compact breadcrumb context replace the full trail.
- Deep links to a Destination, Waypoint or Step are supported, subject to routing and authentication.
- Hover is never required. Collapsed-rail tooltips repeat the accessible name.

Viewport validation widths for step 4 (design-instructions §17, Prompt 4): **375, 768, 1024, 1440 and 1920 px**. The
existing e2e suite already asserts no horizontal overflow on the design-foundation page for desktop Chromium and a
Pixel 7 profile.

## Capacitor and native WebViews

- **Implemented:**
  - `index.html` sets `viewport-fit=cover`.
  - `src/styles/base/_platform.scss` exposes `--safe-area-top`, `--safe-area-right`, `--safe-area-bottom` and
    `--safe-area-left` from `env(safe-area-inset-*)`, with a fallback of `0px`.
  - `overscroll-behavior-y: none` stops iOS rubber-banding from revealing the WebView background.
- **Specified (step 4 and step 7):**
  - The shell pads the top bar by `--safe-area-top` and the bottom navigation by `--safe-area-bottom`. In landscape the
    left and right insets also apply.
  - Content gets `padding-bottom` equal to the bottom-navigation height plus the safe area, so the last item can scroll
    clear of the navigation.
  - `scroll-padding-top` and `scroll-padding-bottom` match the bars, so focused or anchored elements are never hidden
    (WCAG 2.4.11).
  - Dialogs and bottom sheets stay clear of system navigation areas (§6.4).
  - On-screen keyboard: use correct `type` and `inputmode` attributes. Handle WebView resize and scrolling the focused
    input into view. Whether to add `@capacitor/keyboard` (not installed) is to be decided in step 7.
  - No native platforms exist yet (`npx cap add ios|android` is pending). Device verification is pending, see
    [ASSET_EXPORTS.md](ASSET_EXPORTS.md#pending).

## Typography across breakpoints

The type scale switches at **`md` (768 px)**. Below it the mobile sizes apply; from 768 px the desktop sizes apply. The
generated SCSS overrides the `--typescale-*` variables inside `@media (min-width: 768px)`, so components never need
their own media query for type.

| Style      | Mobile (< 768) | Desktop (≥ 768) | Weight                 |
| ---------- | -------------- | --------------- | ---------------------- |
| Display    | 36 / 42        | 48 / 56         | 400 (DM Serif Display) |
| H1         | 30 / 38        | 36 / 44         | 600                    |
| H2         | 24 / 32        | 28 / 36         | 600                    |
| H3         | 20 / 28        | 22 / 30         | 600                    |
| H4         | 18 / 26        | 18 / 26         | 600                    |
| Body large | 16 / 24        | 16 / 26         | 400                    |
| Body       | 14 / 22        | 14 / 22         | 400                    |
| Label      | 12 / 16        | 12 / 16         | 600                    |
| Caption    | 11 / 16        | 11 / 16         | 400                    |
| Metric     | 28 / 34        | 32 / 38         | 600, tabular numerals  |

All sizes are in px (size / line height). The type uses px values and does not scale with the browser's default
font-size setting. Page zoom still scales it. Whether to move to `rem` for user font-size preferences is to verify
during step 7.

## Sass usage (mobile-first)

```scss
@use 'abstracts' as atlas;

.page {
  display: grid;
  gap: var(--space-4);
  padding-inline: var(--layout-gutter-mobile);

  @include atlas.up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-inline: var(--layout-gutter-tablet);
  }

  @include atlas.up(xl) {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    max-width: var(--layout-content-max);
    padding-inline: var(--layout-gutter-desktop);
  }
}

.title {
  @include atlas.style(h2); // responsive automatically via the generated variables
}

.bottom-nav {
  height: calc(var(--layout-bottom-nav-height) + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);

  @include atlas.up(md) {
    display: none;
  }
}
```

- `atlas.up($bp)` uses `min-width`.
- `atlas.down($bp)` uses `max-width: bp − 0.02px`. Use it only for mobile-specific overrides.
- `atlas.between($a, $b)` applies from `$a` up to, but not including, `$b`.
- An unknown breakpoint name is a compile error.
- In TypeScript, observe breakpoints with CDK `BreakpointObserver` and `` `(min-width: ${breakpoints.md}px)` ``.
