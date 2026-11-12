# Accessibility

**Target: WCAG 2.2 level AA** on web, iOS WebView and Android WebView (design-instructions §11).

Status key:

- **Implemented** means it is in the foundation (design steps 1–3) and checked by a script or test.
- **Specified** means it is a rule for components and pages that are not built yet.
- **Pending** means it is a manual check that has not been done yet.

Automated tools do not replace manual keyboard and screen-reader testing.

## Summary

| Area                          | Rule                                                                                                                          | Status                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Contrast                      | Every declared foreground/background pair is checked in CI. Text ≥ 4.5:1, large text ≥ 3:1, non-text ≥ 3:1.                   | Implemented                                             |
| Colour is not the only signal | Status = icon + text label. Dimension = icon + name. Links are underlined.                                                    | Implemented (primitives); Specified (components)        |
| Focus                         | 2px ring, 2px offset, gold on inverse surfaces, `Highlight` in forced colours, Material strong focus indicators               | Implemented                                             |
| Keyboard                      | Skip link is the first Tab stop. Logical order. No keyboard traps. Dialogs trap focus and close on Escape.                    | Skip link Implemented (foundation page); rest Specified |
| Reduced motion                | Duration tokens are zeroed and animations clamped under `prefers-reduced-motion: reduce`                                      | Implemented                                             |
| Touch targets                 | ≥ 44 × 44 CSS px (`--size-touch-target-min`), 48 preferred                                                                    | Token and mixin Implemented; usage Specified            |
| Icons                         | Decorative by default (`aria-hidden`). A labelled icon gets `role="img"` and `aria-label`. Icon-only buttons name the button. | Implemented                                             |
| Charts, graphs, timelines     | Text summary plus a list or table alternative                                                                                 | Specified                                               |
| Forms                         | Visible labels and clear, programmatically associated validation messages                                                     | Specified                                               |
| Hover                         | Nothing essential is available on hover only                                                                                  | Specified                                               |
| Zoom and reflow               | 200% zoom without loss and 320 CSS px reflow without horizontal scroll                                                        | Pending (manual)                                        |
| Screen readers                | VoiceOver (iOS/macOS) and TalkBack pass on every page                                                                         | Pending (manual)                                        |

## Contrast

### Method

- **Source:** `design/tokens/contrast-pairs.json` declares every foreground/background pair the UI uses. There are 85
  pairs, covering the light theme and the dark draft.
- **Script:** `scripts/design-tokens/check-contrast.mjs` resolves the token references and computes the WCAG
  relative-luminance contrast ratio (`(L1 + 0.05) / (L2 + 0.05)`, sRGB linearisation). It compares the result with the
  pair's level:

  | Level      | Minimum | WCAG SC                                                          |
  | ---------- | ------- | ---------------------------------------------------------------- |
  | `text`     | 4.5:1   | 1.4.3 Contrast (Minimum)                                         |
  | `large`    | 3:1     | 1.4.3 (≥ 24 px, or ≥ 18.66 px bold)                              |
  | `non-text` | 3:1     | 1.4.11 Non-text Contrast                                         |
  | `info`     | none    | Reported only: a documented limitation with a mitigation (below) |

- **Commands:**
  - `npm run contrast:check` is part of `npm run design:check`. It exits non-zero if any text, large or non-text pair
    fails.
  - `node scripts/design-tokens/check-contrast.mjs --markdown` prints the table below.

**Result at the time of writing:** 85 pairs, **0 failing**. Eleven pairs are `info` rows that document limitations.

### Generated table

The table between the markers is the verbatim output of `node scripts/design-tokens/check-contrast.mjs --markdown`.
Regenerate it whenever `colors.json` or `contrast-pairs.json` changes.

<!-- contrast-table:start — generated, do not edit by hand -->
<!-- prettier-ignore-start -->
| Use | Foreground | Background | Ratio | Required | Result |
| --- | --- | --- | ---: | ---: | --- |
| Primary text on card | `neutral.900` #252B33 | `white` #FFFFFF | 14.27:1 | 4.5:1 (text) | Pass |
| Primary text on page | `neutral.900` #252B33 | `brand.ivory.50` #FBF9F4 | 13.56:1 | 4.5:1 (text) | Pass |
| Primary text on subtle surface | `neutral.900` #252B33 | `brand.ivory.100` #F5F0E6 | 12.56:1 | 4.5:1 (text) | Pass |
| Primary text on achievement surface | `neutral.900` #252B33 | `brand.gold.200` #EBD9B9 | 10.30:1 | 4.5:1 (text) | Pass |
| Secondary text on card | `neutral.700` #4D5661 | `white` #FFFFFF | 7.45:1 | 4.5:1 (text) | Pass |
| Secondary text on page | `neutral.700` #4D5661 | `brand.ivory.50` #FBF9F4 | 7.08:1 | 4.5:1 (text) | Pass |
| Secondary text on subtle surface | `neutral.700` #4D5661 | `brand.ivory.100` #F5F0E6 | 6.56:1 | 4.5:1 (text) | Pass |
| Muted text on card | `neutral.600` #5F6873 | `white` #FFFFFF | 5.65:1 | 4.5:1 (text) | Pass |
| Muted text on page | `neutral.600` #5F6873 | `brand.ivory.50` #FBF9F4 | 5.37:1 | 4.5:1 (text) | Pass |
| Muted text on subtle surface | `neutral.600` #5F6873 | `brand.ivory.100` #F5F0E6 | 4.98:1 | 4.5:1 (text) | Pass |
| neutral-500 as small text: NOT allowed (use neutral-600) | `neutral.500` #747E89 | `white` #FFFFFF | 4.13:1 | info | Documented limitation |
| Control border on card | `neutral.500` #747E89 | `white` #FFFFFF | 4.13:1 | 3:1 (non-text) | Pass |
| Control border on page | `neutral.500` #747E89 | `brand.ivory.50` #FBF9F4 | 3.92:1 | 3:1 (non-text) | Pass |
| Link on card | `brand.midnight.800` #203650 | `white` #FFFFFF | 12.32:1 | 4.5:1 (text) | Pass |
| Link on page | `brand.midnight.800` #203650 | `brand.ivory.50` #FBF9F4 | 11.71:1 | 4.5:1 (text) | Pass |
| Primary button label | `white` #FFFFFF | `brand.midnight.900` #14243A | 15.63:1 | 4.5:1 (text) | Pass |
| Primary button label (hover) | `white` #FFFFFF | `brand.midnight.800` #203650 | 12.32:1 | 4.5:1 (text) | Pass |
| Focus ring / secondary button border on page | `brand.midnight.900` #14243A | `brand.ivory.50` #FBF9F4 | 14.86:1 | 3:1 (non-text) | Pass |
| Navigation label on sidebar | `brand.ivory.100` #F5F0E6 | `brand.midnight.900` #14243A | 13.77:1 | 4.5:1 (text) | Pass |
| Active navigation label | `brand.ivory.100` #F5F0E6 | `brand.midnight.800` #203650 | 10.84:1 | 4.5:1 (text) | Pass |
| Text on dark hero | `brand.ivory.100` #F5F0E6 | `brand.midnight.950` #101D32 | 14.86:1 | 4.5:1 (text) | Pass |
| Secondary text on sidebar | `neutral.300` #D4D8DC | `brand.midnight.900` #14243A | 10.91:1 | 4.5:1 (text) | Pass |
| Active nav indicator / focus ring on sidebar | `brand.gold.500` #D5AD70 | `brand.midnight.900` #14243A | 7.48:1 | 3:1 (non-text) | Pass |
| Gold text on dark | `brand.gold.500` #D5AD70 | `brand.midnight.900` #14243A | 7.48:1 | 4.5:1 (text) | Pass |
| Small gold text on card | `brand.gold.800` #805B2F | `white` #FFFFFF | 6.08:1 | 4.5:1 (text) | Pass |
| Small gold text on page | `brand.gold.800` #805B2F | `brand.ivory.50` #FBF9F4 | 5.78:1 | 4.5:1 (text) | Pass |
| Gold title on achievement surface | `brand.gold.800` #805B2F | `brand.gold.200` #EBD9B9 | 4.39:1 | 3:1 (large) | Pass |
| Large gold emphasis on card | `brand.gold.700` #A77C43 | `white` #FFFFFF | 3.75:1 | 3:1 (large) | Pass |
| Gold icon / selection on card | `brand.gold.700` #A77C43 | `white` #FFFFFF | 3.75:1 | 3:1 (non-text) | Pass |
| Achievement gold: decorative only on light surfaces | `brand.gold.600` #B88D52 | `white` #FFFFFF | 3.01:1 | info | Documented limitation |
| Success icon/dot on card | `status.success` #4F8064 | `white` #FFFFFF | 4.56:1 | 3:1 (non-text) | Pass |
| Success icon/dot on page | `status.success` #4F8064 | `brand.ivory.50` #FBF9F4 | 4.33:1 | 3:1 (non-text) | Pass |
| In-progress icon/dot on card | `status.in-progress` #426D9B | `white` #FFFFFF | 5.40:1 | 3:1 (non-text) | Pass |
| In-progress icon/dot on page | `status.in-progress` #426D9B | `brand.ivory.50` #FBF9F4 | 5.13:1 | 3:1 (non-text) | Pass |
| Upcoming icon/dot on card | `status.upcoming` #9A7A43 | `white` #FFFFFF | 4.01:1 | 3:1 (non-text) | Pass |
| Upcoming icon/dot on page | `status.upcoming` #9A7A43 | `brand.ivory.50` #FBF9F4 | 3.81:1 | 3:1 (non-text) | Pass |
| At-risk icon/dot on card | `status.at-risk` #B56B45 | `white` #FFFFFF | 4.07:1 | 3:1 (non-text) | Pass |
| At-risk icon/dot on page | `status.at-risk` #B56B45 | `brand.ivory.50` #FBF9F4 | 3.87:1 | 3:1 (non-text) | Pass |
| Blocked icon/dot on card | `status.blocked` #A65353 | `white` #FFFFFF | 5.27:1 | 3:1 (non-text) | Pass |
| Blocked icon/dot on page | `status.blocked` #A65353 | `brand.ivory.50` #FBF9F4 | 5.01:1 | 3:1 (non-text) | Pass |
| Not-started icon/dot on card | `status.not-started` #747E89 | `white` #FFFFFF | 4.13:1 | 3:1 (non-text) | Pass |
| Not-started icon/dot on page | `status.not-started` #747E89 | `brand.ivory.50` #FBF9F4 | 3.92:1 | 3:1 (non-text) | Pass |
| Destructive button label | `white` #FFFFFF | `status.blocked` #A65353 | 5.27:1 | 4.5:1 (text) | Pass |
| Upcoming as text: not allowed; label uses text-secondary | `status.upcoming` #9A7A43 | `white` #FFFFFF | 4.01:1 | info | Documented limitation |
| At-risk as text: not allowed; label uses text-secondary | `status.at-risk` #B56B45 | `white` #FFFFFF | 4.07:1 | info | Documented limitation |
| Career chip label | `dimension.career.strong` #426D9B | `dimension.career.tint` #EAF1F8 | 4.74:1 | 4.5:1 (text) | Pass |
| Finance chip label | `dimension.finance.strong` #805B2F | `dimension.finance.tint` #F6EFE3 | 5.32:1 | 4.5:1 (text) | Pass |
| Health chip label | `dimension.health.strong` #52765B | `dimension.health.tint` #EDF3EE | 4.55:1 | 4.5:1 (text) | Pass |
| Love chip label | `dimension.love.strong` #965B4A | `dimension.love.tint` #F8EEEA | 4.73:1 | 4.5:1 (text) | Pass |
| Passion chip label | `dimension.passion.strong` #6F5C98 | `dimension.passion.tint` #F1EEF7 | 5.00:1 | 4.5:1 (text) | Pass |
| Friendship chip label | `dimension.friendship.strong` #3F7776 | `dimension.friendship.tint` #EAF3F2 | 4.52:1 | 4.5:1 (text) | Pass |
| Family chip label | `dimension.family.strong` #80683E | `dimension.family.tint` #F5F0E5 | 4.66:1 | 4.5:1 (text) | Pass |
| Career label on card | `dimension.career.strong` #426D9B | `white` #FFFFFF | 5.40:1 | 4.5:1 (text) | Pass |
| Finance label on card | `dimension.finance.strong` #805B2F | `white` #FFFFFF | 6.08:1 | 4.5:1 (text) | Pass |
| Health label on card | `dimension.health.strong` #52765B | `white` #FFFFFF | 5.12:1 | 4.5:1 (text) | Pass |
| Love label on card | `dimension.love.strong` #965B4A | `white` #FFFFFF | 5.40:1 | 4.5:1 (text) | Pass |
| Passion label on card | `dimension.passion.strong` #6F5C98 | `white` #FFFFFF | 5.74:1 | 4.5:1 (text) | Pass |
| Friendship label on card | `dimension.friendship.strong` #3F7776 | `white` #FFFFFF | 5.11:1 | 4.5:1 (text) | Pass |
| Family label on card | `dimension.family.strong` #80683E | `white` #FFFFFF | 5.29:1 | 4.5:1 (text) | Pass |
| Career accent on dark navigation | `dimension.career` #759ECA | `brand.midnight.900` #14243A | 5.58:1 | 3:1 (non-text) | Pass |
| Finance accent on dark navigation | `dimension.finance` #D5AD70 | `brand.midnight.900` #14243A | 7.48:1 | 3:1 (non-text) | Pass |
| Health accent on dark navigation | `dimension.health` #91AD99 | `brand.midnight.900` #14243A | 6.43:1 | 3:1 (non-text) | Pass |
| Love accent on dark navigation | `dimension.love` #CA8A76 | `brand.midnight.900` #14243A | 5.52:1 | 3:1 (non-text) | Pass |
| Passion accent on dark navigation | `dimension.passion` #A99ACB | `brand.midnight.900` #14243A | 6.08:1 | 3:1 (non-text) | Pass |
| Friendship accent on dark navigation | `dimension.friendship` #78AFAE | `brand.midnight.900` #14243A | 6.36:1 | 3:1 (non-text) | Pass |
| Family accent on dark navigation | `dimension.family` #C5A66D | `brand.midnight.900` #14243A | 6.74:1 | 3:1 (non-text) | Pass |
| Career accent on light: decorative fill; pair with strong stroke + text label | `dimension.career` #759ECA | `white` #FFFFFF | 2.80:1 | info | Documented limitation |
| Finance accent on light: decorative fill | `dimension.finance` #D5AD70 | `white` #FFFFFF | 2.09:1 | info | Documented limitation |
| Health accent on light: decorative fill | `dimension.health` #91AD99 | `white` #FFFFFF | 2.43:1 | info | Documented limitation |
| Love accent on light: decorative fill | `dimension.love` #CA8A76 | `white` #FFFFFF | 2.83:1 | info | Documented limitation |
| Passion accent on light: decorative fill | `dimension.passion` #A99ACB | `white` #FFFFFF | 2.57:1 | info | Documented limitation |
| Friendship accent on light: decorative fill | `dimension.friendship` #78AFAE | `white` #FFFFFF | 2.46:1 | info | Documented limitation |
| Family accent on light: decorative fill | `dimension.family` #C5A66D | `white` #FFFFFF | 2.32:1 | info | Documented limitation |
| Dark draft: primary text on card | `brand.ivory.100` #F5F0E6 | `brand.midnight.900` #14243A | 13.77:1 | 4.5:1 (text) | Pass |
| Dark draft: secondary text on page | `brand.ivory.200` #EAE2D4 | `brand.midnight.950` #101D32 | 13.13:1 | 4.5:1 (text) | Pass |
| Dark draft: muted text on subtle surface | `neutral.300` #D4D8DC | `brand.midnight.800` #203650 | 8.60:1 | 4.5:1 (text) | Pass |
| Dark draft: primary button label | `brand.midnight.950` #101D32 | `brand.gold.500` #D5AD70 | 8.07:1 | 4.5:1 (text) | Pass |
| Dark draft: success label | `status-on-dark.success` #9CB6A5 | `brand.midnight.800` #203650 | 5.66:1 | 4.5:1 (text) | Pass |
| Dark draft: in-progress label | `status-on-dark.in-progress` #95ACC3 | `brand.midnight.800` #203650 | 5.26:1 | 4.5:1 (text) | Pass |
| Dark draft: upcoming label | `status-on-dark.upcoming` #C6B393 | `brand.midnight.800` #203650 | 6.02:1 | 4.5:1 (text) | Pass |
| Dark draft: at-risk label | `status-on-dark.at-risk` #D5AB94 | `brand.midnight.800` #203650 | 5.91:1 | 4.5:1 (text) | Pass |
| Dark draft: blocked label | `status-on-dark.blocked` #CC9E9B | `brand.midnight.800` #203650 | 5.24:1 | 4.5:1 (text) | Pass |
| Dark draft: not-started label | `status-on-dark.not-started` #B1B5B9 | `brand.midnight.800` #203650 | 5.97:1 | 4.5:1 (text) | Pass |
| Dark draft: control border on card | `neutral.500` #747E89 | `brand.midnight.900` #14243A | 3.79:1 | 3:1 (non-text) | Pass |
| Dark draft: focus ring on page | `brand.gold.500` #D5AD70 | `brand.midnight.950` #101D32 | 8.07:1 | 3:1 (non-text) | Pass |
<!-- prettier-ignore-end -->
<!-- contrast-table:end -->

### Documented limitations and mitigations

| Limitation (`info` rows)                                                       | Rule                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `neutral-500` is 4.13:1 on white                                               | Never use it for text. Muted text uses `neutral-600` (`--color-text-muted`, ≥ 4.98:1). `neutral-500` is for control borders, disabled states and the not-started icon only. ([DD-07](DESIGN_DECISIONS.md#dd-07-muted-text-uses-neutral-600))                           |
| Upcoming (4.01:1) and at-risk (4.07:1) status colours are below 4.5:1 for text | Status colours are for icons and dots only, which need ≥ 3:1. Status labels use `--color-text-secondary`. ([DD-08](DESIGN_DECISIONS.md#dd-08-status-is-never-conveyed-by-colour-alone))                                                                                |
| Dimension accents are 2.09–2.83:1 on white                                     | On light surfaces accents are decorative: fills, tints and chart areas. Meaningful marks use `--color-dimension-*-strong` (≥ 4.5:1 on white and on the tint) and a text label. ([DD-09](DESIGN_DECISIONS.md#dd-09-dimension-accents-are-decorative-on-light-surfaces)) |
| `gold-600` is 3.01:1 on white                                                  | Decorative only on light surfaces. Small gold text uses `gold-800`, and large gold text or non-text marks use `gold-700`. ([DD-11](DESIGN_DECISIONS.md#dd-11-gold-usage-tiers))                                                                                        |

### Colour rules (summary)

1. Body text uses `--color-text-primary` or `--color-text-secondary`. Metadata uses `--color-text-muted`. Disabled text
   uses `--color-text-disabled`, which is exempt under WCAG 1.4.3.
2. **Status = icon + label.** Get both from `ATLAS_STATUSES`. In-progress `#426D9B` is the same colour as Career strong,
   so never rely on hue to tell them apart ([DD-10](DESIGN_DECISIONS.md#dd-10-in-progress-status-equals-career-strong)).
3. **Life Dimension = icon + name**, using the colours from `LIFE_DIMENSIONS`.
4. Links use `--color-text-link` and are always underlined.
5. Selected states combine tint, border, icon and text (design-instructions §15). They never rely on colour alone.
6. Chart series use dimension accents with direct labels or a legend that carries text. Gridlines are minimal, and
   colour-vision-ambiguous pairs (for example Health and Friendship) are never the only distinction.
7. On navy surfaces, use the `inverse` text tokens and the `status-on-dark` colours.

## Focus

- **Global ring** (`src/styles/base/_accessibility.scss`): `:focus-visible` draws a `--size-focus-ring-width` (2px)
  solid outline at `--size-focus-ring-offset` (2px) in `--color-focus-ring`. That is midnight-900 in light (14.86:1 on
  ivory) and gold-500 in dark.
- **Inverse surfaces:** any container with `data-surface="inverse"` (sidebar, hero, bottom navigation) switches to
  `--color-focus-ring-inverse`, gold-500 at 7.48:1 on midnight-900.
- **Forced colours:** under `@media (forced-colors: active)` the outline colour is `Highlight`. `<atlas-logo>` has a
  forced-colours fallback.
- **Material:** `mat.strong-focus-indicators` draws a 2px solid indicator with a 4px radius.
- **In components:** use `@include atlas.focus-ring;` inside `:focus-visible`. Never write `outline: none` without a
  replacement.
- **Focus order and visibility** (WCAG 2.4.11 Focus Not Obscured): sticky top bars and the bottom navigation must not
  cover the focused element. Use `scroll-padding` equal to the bar heights plus safe areas (Specified, step 4).

## Keyboard

- **Skip link (Implemented on the design-foundation page):** `.atlas-skip-link` → `#main`. It is visually hidden until
  focused and is the first Tab stop. `e2e/design-foundation.spec.ts` tests this. The app shell (step 4) must keep it.
- **Specified for steps 4–6:**
  - Sidebar and bottom-navigation links are native `<a routerLink>` with `aria-current="page"` on the active item.
  - Menus, tabs and lists use Angular CDK a11y (`FocusKeyManager`, `cdkTrapFocus`).
  - Dialogs return focus to their trigger and close on Escape.
  - Graph and timeline canvases are focusable regions with documented keys, and they always have a list alternative.
  - Every action available by drag (for example, rescheduling on a timeline) also has a non-drag control (WCAG 2.5.7).

## Reduced motion

Implemented in `src/styles/base/_accessibility.scss`. Under `prefers-reduced-motion: reduce`:

- `--duration-micro`, `--duration-standard` and `--duration-page` become `0ms`.
- All transitions and animations are clamped to `0.01ms` with one iteration, and `scroll-behavior` is `auto`.
- Angular Material disables its own animations automatically.

Components must animate through the duration tokens. Progress may animate once after a user action. Celebration
animations for Milestone Awards must be skippable and must not run at all under reduced motion.

## Touch targets

- **Tokens:** `--size-touch-target-min` is 44 px (the WCAG 2.5.8 floor is 24 px; Atlas uses the stricter 44 from §11).
  `--size-touch-target-preferred` is 48 px.
- **Mixin:** `@include atlas.touch-target;` sets the minimum width and height without changing the visual size.
- The wireframe `mockups/app-shell-mobile.svg` places top-bar actions on a 44 px grid and uses a 64 px bottom
  navigation.

## Icons and images

Implemented by `<atlas-icon>` (`src/app/shared/icons/atlas-icon.ts`):

| Usage                                | Markup                                                                              | Result                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| Decorative icon next to visible text | `<atlas-icon name="destinations" />`                                                | `aria-hidden="true"`                            |
| Meaningful standalone icon           | `<atlas-icon name="status-blocked" label="Blocked" />`                              | `role="img"` and `aria-label="Blocked"`         |
| Icon-only button                     | `<button mat-icon-button aria-label="Search"><atlas-icon name="search" /></button>` | The button carries the name; the icon is hidden |

- Add a tooltip (`matTooltip`) to icon-only buttons where the meaning is not universal. Never use emoji as icons.
- `<atlas-logo>` exposes `role="img"` and `aria-label="IKIGAI ATLAS"`. Set `decorative` when visible brand text is
  adjacent.
- Brand SVG masters have `role="img"` and a `<title>`. The wireframes have `<title>` and `<desc>`.

## Status is never colour-only

`ATLAS_STATUSES` (`src/app/shared/design-system/statuses.ts`) defines, for every status:

- a **label**: Completed, In progress, Upcoming, At risk, Blocked, Not started;
- an **icon**: `circle-check`, `progress`, `hourglass`, `alert-triangle`, `ban`, `circle-dashed`;
- a **colour token**.

Any status display must render the label, either visibly or as the accessible name of a labelled icon. The
design-foundation page demonstrates this.

## Charts, graphs and timelines (Specified)

The visualisation libraries are planned for later (ADR-0004) and are not installed yet. Requirements:

- A screen-reader summary. For example: "1 active Destination in Career, 0 of 7 Waypoints completed; next: Submit
  application, December 2026".
- A **list or table alternative** for every graph (Connections), timeline (Journey Overview) and chart (Life Dimensions
  balance). The alternative must be reachable on mobile.
- Units and date ranges are always labelled. Never imply more precision than the data has. Uncertain forecasts are
  marked as such (§18 principle 6).
- Canvas renderers are `aria-hidden` behind an accessible HTML layer.

## Headings, landmarks and forms (Specified)

- One `<h1>` per page, with no skipped levels. Type styles (`.atlas-h1` to `.atlas-h4`) are independent of heading level.
- Landmarks: `header`, `nav` (labelled "Primary" or "Secondary"), `main#main`, and `aside` for side panels.
- Route changes update `document.title` using the pattern "Page · IKIGAI ATLAS" and move focus to the page heading or
  `main`.
- Forms use visible `<mat-label>`, error text linked through `mat-error`, and no placeholder-only labels. Destructive
  actions ask for confirmation and explain downstream effects (§15).

## Automated checks

| Check                     | Tool                                                                                                                                                                                              | Command                  | Status                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------ |
| Token contrast            | `scripts/design-tokens/check-contrast.mjs`                                                                                                                                                        | `npm run contrast:check` | Implemented (CI via `design:check`)        |
| Rendered-page audit       | Playwright 1.65 and `@axe-core/playwright` 4.14. Tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`. Light and dark themes. Projects `desktop-chromium` and `mobile-chromium` (Pixel 7). | `npm run e2e`            | Implemented for the design-foundation page |
| Template lint             | angular-eslint `templateAccessibility` (for example alt text, label association, valid ARIA, no `autofocus`, interactive elements focusable)                                                      | `npm run lint`           | Implemented                                |
| Hex colours in components | Stylelint rule for `src/app/**`                                                                                                                                                                   | `npm run lint:styles`    | Implemented                                |
| Per-page axe audits       | Extend the e2e suite to every route                                                                                                                                                               | `npm run e2e`            | Specified (step 6)                         |
| Visual regression         | To be chosen (step 7)                                                                                                                                                                             | n/a                      | Planned                                    |

The Playwright web server starts `ng serve` on port 4200.

## Manual checklist (Pending)

Run this checklist before each release and after the shell (step 4) and each page template (step 6) is built.

- [ ] Keyboard only: complete every flow, with a visible focus ring, a logical order and no traps. Escape closes
      dialogs and menus.
- [ ] Screen readers: VoiceOver on macOS Safari and on iOS (Capacitor build), and TalkBack on Android (Capacitor build).
      Check landmarks, headings, names, status announcements and chart summaries.
- [ ] Zoom to 200% (WCAG 1.4.4) with no loss of content. Reflow at 320 CSS px, the equivalent of 400% on 1280
      (WCAG 1.4.10), with no horizontal scroll except for data tables or graphs that have an alternative.
- [ ] Text spacing override (WCAG 1.4.12) with no clipping.
- [ ] Windows High Contrast / forced colours: focus is visible, the logo is visible and controls are distinguishable.
- [ ] `prefers-reduced-motion` on iOS, Android and desktop: no essential motion remains.
- [ ] Dark theme, once it is user-selectable: repeat the contrast spot checks on real screens.
- [ ] Touch: every target is ≥ 44 px, and nothing sits under safe areas, the notch, the home indicator or the
      on-screen keyboard.
- [ ] Colour-vision simulation (protanopia, deuteranopia, tritanopia) on dimension and status views.
