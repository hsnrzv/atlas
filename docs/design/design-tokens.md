# Design tokens — Figma V3 to code

- Status: approved 2026-11-14 (roadmap §4); token files change in phase 2 (T-1…T-3)
- Source: Figma file `zlFVZJ57AYBHUBhoIsT030`, page 02 Foundations (`214:1720`), variables read with
  `get_variable_defs` on 2026-11-14 in both modes (light values re-verified on `214:2435`, `230:8180` and
  `230:25490`)
- Pipeline: [ADR-0007](../adr/0007-design-tokens-source-of-truth.md), amended by [ADR-0010](../adr/0010-figma-visual-source-of-truth.md)
- Related: [figma-handoff.md](figma-handoff.md), [component-mapping.md](component-mapping.md)

## 1. Principles

1. **Figma variables decide the values.** `design/tokens/*.json` is the version-controlled implementation of those
   values that the build reads; it is not a separate visual source. Values change in Figma first, then in JSON
   through a reviewed PR (§6). Nobody edits generated files. The build never contacts Figma.
2. **The pipeline stays.** `npm run tokens:build` still generates `_tokens.generated.scss`, `tokens.generated.ts` and
   the breakpoint map. `tokens:check`, `contrast:check` and Stylelint (no raw colours in `src/app`) stay as CI gates.
3. **Components use semantic tokens only.** Primitives exist so semantics can reference them. A component that needs
   a primitive is a sign that a semantic token is missing.
4. **Both themes are first-class.** Every semantic token has a light and a dark value, and every text/UI pair is in
   `contrast-pairs.json` for both.
5. **Keep CSS names stable where the meaning is unchanged** (`--color-text-primary`, `--color-surface-card`, …), so
   the change is mostly in values. New Figma roles get new names. Removed roles are deleted after their last use.

## 2. Colour primitives ("Quiet Tide")

The current primitives (`midnight`, `ivory`, `gold`, `neutral`) come from the pre-Figma palette in
`design-instructions.md` §2.1. They are replaced by the Figma primitives below. The Venn colours stay.

| Figma variable                   | Proposed JSON path                                               | Value                                         |
| -------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `space`                          | `color.tide.space`                                               | `#0B1020`                                     |
| `indigo`                         | `color.tide.indigo`                                              | `#151B35`                                     |
| `navy`                           | `color.tide.navy`                                                | `#202A46`                                     |
| `panel`                          | `color.tide.panel`                                               | `#273452`                                     |
| `border-dark`                    | `color.tide.border-dark`                                         | `#36435D`                                     |
| `muted`                          | `color.tide.muted`                                               | `#8290AA`                                     |
| `secondary`                      | `color.tide.secondary`                                           | `#A8B4CC`                                     |
| `white`                          | `color.tide.white`                                               | `#F5F7FC`                                     |
| `forest`                         | `color.green.forest`                                             | `#123F3C`                                     |
| `jade`                           | `color.green.jade`                                               | `#205D55`                                     |
| `emerald`                        | `color.green.emerald`                                            | `#2D7266`                                     |
| `teal`                           | `color.green.teal`                                               | `#4B9387`                                     |
| `violet-deep`                    | `color.violet.deep`                                              | `#493566`                                     |
| `violet`                         | `color.violet.base`                                              | `#65518C`                                     |
| `purple`                         | `color.violet.purple`                                            | `#8469B5`                                     |
| `accent/violet`                  | `color.violet.accent`                                            | `#B8A5D0`                                     |
| `gold`                           | `color.gold.dark`                                                | `#D4B477`                                     |
| `light-gold`                     | `color.gold.light`                                               | `#A17A3F`                                     |
| `light-page`                     | `color.light.page`                                               | `#F5F7FA`                                     |
| `light-card`                     | `color.light.card`                                               | `#FFFFFF`                                     |
| `light-raised`                   | `color.light.raised`                                             | `#EAF0F4`                                     |
| `light-green`                    | `color.light.green`                                              | `#E8F1EE`                                     |
| `light-text`                     | `color.light.text`                                               | `#1D2935`                                     |
| `light-secondary`                | `color.light.secondary`                                          | `#586578`                                     |
| `light-action`                   | `color.light.action`                                             | `#2D6A61`                                     |
| `light-border`                   | `color.light.border`                                             | `#DCE4E9`                                     |
| Logo top / left / right / bottom | `color.brand.venn.blue` / `teal` / `violet` / `rose` (unchanged) | `#5685B5` / `#348F84` / `#8A73BB` / `#B17D9E` |

`#A17A3F` on white is 3.91:1, so `color.gold.light` is decorative or large text only. Small achievement text in
light uses `text/achievement` (`#765728`).

## 3. Semantic colour tokens

CSS variable names keep the existing `--color-<group>-<role>` pattern. "New" means the name does not exist today.

| Figma semantic          | CSS custom property                                 | Dark      | Light     | Status / current light value                                                                       |
| ----------------------- | --------------------------------------------------- | --------- | --------- | -------------------------------------------------------------------------------------------------- |
| background/page         | `--color-surface-page`                              | `#0B1020` | `#F5F7FA` | changed (was `#FBF9F4`)                                                                            |
| background/navigation   | `--color-surface-navigation`                        | `#151B35` | `#FFFFFF` | new (sidebar was inverse navy in light)                                                            |
| surface/card            | `--color-surface-card`                              | `#202A46` | `#FFFFFF` | dark changed                                                                                       |
| surface/raised          | `--color-surface-raised`                            | `#273452` | `#EAF0F4` | new                                                                                                |
| surface/subtle          | `--color-surface-subtle`                            | `#151B35` | `#E8F1EE` | changed                                                                                            |
| surface/hero            | `--color-surface-hero`                              | `#151B35` | `#FFFFFF` | new                                                                                                |
| achievement/surface     | `--color-surface-achievement`                       | `#2E2B27` | `#F4EFE5` | changed                                                                                            |
| text/primary            | `--color-text-primary`                              | `#F5F7FC` | `#1D2935` | changed                                                                                            |
| text/secondary          | `--color-text-secondary`                            | `#A8B4CC` | `#586578` | changed                                                                                            |
| text/muted              | `--color-text-muted`                                | `#A8B4CC` | `#586578` | changed (same as secondary in V3)                                                                  |
| text/on-action          | `--color-action-on-primary`                         | `#F5F7FC` | `#FFFFFF` | dark changed                                                                                       |
| text/achievement        | `--color-text-achievement`                          | `#D4B477` | `#765728` | changed                                                                                            |
| action/primary          | `--color-action-primary`                            | `#205D55` | `#2D6A61` | changed (was navy / gold)                                                                          |
| action/hover            | `--color-action-primary-hover`                      | `#2D7266` | `#205D55` | changed                                                                                            |
| action/pressed          | `--color-action-primary-pressed`                    | `#123F3C` | `#123F3C` | new                                                                                                |
| action/disabled         | `--color-action-disabled`                           | `#273452` | `#EAF0F4` | new                                                                                                |
| action/disabled-label   | `--color-action-on-disabled`                        | `#A8B4CC` | `#586578` | new                                                                                                |
| border/subtle           | `--color-border-subtle`                             | `#36435D` | `#DCE4E9` | changed                                                                                            |
| border/control          | `--color-border-control`                            | `#8290AA` | `#798B88` | changed; light value verified (`v3/border/control` on `230:25490`)                                 |
| border/action           | `--color-border-action`                             | `#4B9387` | `#2D6A61` | new (secondary button outline)                                                                     |
| focus/ring              | `--color-focus-ring`                                | `#B8A5D0` | `#65518C` | changed (was navy / gold); 2 px, outside                                                           |
| progress/fill           | `--color-progress-fill`                             | `#4B9387` | `#2D6A61` | new                                                                                                |
| progress/track          | `--color-progress-track`                            | `#273452` | `#DCE4E9` | new                                                                                                |
| nav item active surface | `--color-nav-active` (→ `state/success/background`) | `#1B302C` | `#E8F1EE` | new; replaces the gold `--color-nav-indicator` (node `152:2588`)                                   |
| nav item active accent  | `--color-nav-active-accent` (→ `accent/green`)      | `#4B9387` | none      | new, dark only; the light active item (`214:2435`) binds no accent: success surface + text/primary |

**Signature edge** (upper edge of selected or hero surfaces only, never a full coloured perimeter):

| Token                    | Dark      | Light     |
| ------------------------ | --------- | --------- |
| `--color-edge-0` (0 %)   | `#123F3C` | `#76968D` |
| `--color-edge-1` (30 %)  | `#205D55` | `#71918E` |
| `--color-edge-2` (65 %)  | `#353D60` | `#858B9E` |
| `--color-edge-3` (100 %) | `#493566` | `#9583AE` |

The generator also emits `--gradient-signature-edge` as a `linear-gradient(90deg, …)` built from these stops.

**To retire** after migration: `--color-brand-midnight-*`, `--color-brand-ivory-*`, `--color-brand-gold-*`,
`--color-neutral-*`, `--color-surface-inverse*`, `--color-surface-sunken`, `--color-text-inverse*`, `--color-text-link`
(links use `--color-action-primary` / `--color-border-action`), `--color-nav-indicator`, `--color-status-on-dark-*`.
`_theme.scss` (Material mapping) and `design-foundation` are updated in the same PR.

## 4. Life Dimension and state colours

Each dimension and state has a **foreground** (text, icons, strokes) and a **background** (chip, badge, tint). Both
are theme-aware, so the separate `status-on-dark` primitives go away.

| Dimension  | CSS (`--color-dimension-<key>` / `…-tint`) | Dark fg / bg          | Light fg / bg         |
| ---------- | ------------------------------------------ | --------------------- | --------------------- |
| career     | `--color-dimension-career`                 | `#A6C3DF` / `#1B2D44` | `#426D9B` / `#EAF1F8` |
| finance    | `--color-dimension-finance`                | `#D4B477` / `#302A24` | `#805B2F` / `#F6EFE3` |
| health     | `--color-dimension-health`                 | `#9BBBA7` / `#1B302C` | `#52765B` / `#EDF3EE` |
| love       | `--color-dimension-love`                   | `#D5A498` / `#35242E` | `#965B4A` / `#F8EEEA` |
| passion    | `--color-dimension-passion`                | `#B8A5D0` / `#2C263D` | `#6F5C98` / `#F1EEF7` |
| friendship | `--color-dimension-friendship`             | `#9AC2BC` / `#193337` | `#3F7776` / `#EAF3F2` |
| family     | `--color-dimension-family`                 | `#C6B184` / `#302C25` | `#80683E` / `#F5F0E5` |

The light values equal today's `…-strong` / `…-tint`. Change: `--color-dimension-<key>` becomes the theme-aware
foreground (today it is the lighter light-mode accent such as `#759ECA`). `…-strong` stays as an alias for one
release, then is removed. Chart series use the foreground.

| Figma state | CSS key (unchanged)          | Badge label | Dark fg / bg          | Light fg / bg         |
| ----------- | ---------------------------- | ----------- | --------------------- | --------------------- |
| success     | `--color-status-success`     | Completed\* | `#9BBBA7` / `#1B302C` | `#2D6A61` / `#E8F1EE` |
| active      | `--color-status-in-progress` | In progress | `#A6C3DF` / `#1B2D44` | `#426D9B` / `#EAF1F8` |
| upcoming    | `--color-status-upcoming`    | Upcoming    | `#D4B477` / `#2E2B27` | `#765728` / `#F4EFE5` |
| blocked     | `--color-status-blocked`     | Blocked     | `#DBA6A6` / `#35242E` | `#924D53` / `#F8EEEA` |
| risk        | `--color-status-at-risk`     | At risk     | `#D6AE8F` / `#2E2B27` | `#8F5D36` / `#F4EFE5` |
| neutral     | `--color-status-not-started` | Not started | `#A8B4CC` / `#273452` | `#586578` / `#EAF0F4` |

Background tokens are `--color-status-<key>-tint`. \*Figma badges say "Achieved" while its StepRow and Waypoint legend
say "Completed". Labels are vocabulary owned by ADR-0006, so the UI uses "Completed" everywhere (roadmap R-11); the
Figma inconsistency is reported to the designer. The label is never derived from the colour token. Every
badge has a glyph and a text label; colour is never the only signal.

## 5. Typography, spacing, shape and size

### 5.1 Typography

Figma uses **Manrope** for headings and **Inter** for information. **DM Serif Display is dropped.** Manrope is OFL
1.1 and available as `@fontsource-variable/manrope`. It must be self-hosted (CSP has no font origins), recorded in
`THIRD-PARTY-NOTICES.md` and the license matrix, and checked against the bundle budget.

| Token (`--typescale-*`) | Family  | Weight | Desktop size/line | Mobile size/line | Change                               |
| ----------------------- | ------- | ------ | ----------------- | ---------------- | ------------------------------------ |
| `display`               | Manrope | 700    | 48/56             | 36/42            | family DM Serif → Manrope, 400 → 700 |
| `h1`                    | Manrope | 700    | 36/44             | 30/38            | family, 600 → 700                    |
| `h2`                    | Manrope | 600    | 28/36             | 24/32            | family                               |
| `h3`                    | Manrope | 600    | 22/30             | 20/28            | family                               |
| `h4`                    | Manrope | 600    | 18/26             | 18/26            | family                               |
| `body-large`            | Inter   | 400    | 16/26             | 16/24            | none                                 |
| `body`                  | Inter   | 400    | 14/22             | 14/22            | none                                 |
| `label`                 | Inter   | 600    | 12/16             | 12/16            | none                                 |
| `control` (new)         | Inter   | 600    | 14/22             | 14/22            | new                                  |
| `caption`               | Inter   | 400    | 11/16             | 11/16            | none                                 |
| `metric`                | Inter   | 600    | 32/38             | 28/34            | none                                 |
| `wordmark` (new)        | Manrope | 700    | 22/30, +1 px      | 22/30, +1 px     | new (sidebar lockup `214:2435`)      |

JSON: `font.heading` (new, Manrope stack) replaces `font.display`; `font.sans` stays Inter; `font-weight.bold: 700`
is added. Numbers in metrics, dates and progress use `font-variant-numeric: tabular-nums` (Figma note on `214:2158`).
Letter-spacing values stay until a Figma variable says otherwise.

### 5.2 Spacing, radius, size, layout

| Figma variable              | Token                                                     | Value      | Change                                   |
| --------------------------- | --------------------------------------------------------- | ---------- | ---------------------------------------- |
| space/2, 3, 4, 6, 8, 12, 16 | `space.2` … `space.16`                                    | 8–64       | none (existing 4-px scale is a superset) |
| radius/control              | `radius.control` (alias of `radius.sm`)                   | 8 px       | alias added                              |
| radius/pill                 | `radius.pill`                                             | 999 px     | none                                     |
| radius/card / feature       | `radius.card` / `radius.feature` (aliases of `md` / `lg`) | 12 / 16 px | aliases added (verified on `230:8180`)   |
| border/width                | `border.width`                                            | 1 px       | new                                      |
| progress/height             | `size.progress.height`                                    | 6 px       | new                                      |
| control/compact             | `size.control.height-compact`                             | 44 px      | new (equals the touch-target minimum)    |
| layout/topbar-desktop       | `layout.topbar-height`                                    | 68 px      | none                                     |
| control/height/regular      | `size.control.height`                                     | 48 px      | new                                      |
| icon/size                   | `size.icon.lg`                                            | 24 px      | none                                     |
| icon/stroke                 | `size.icon-stroke`                                        | **2**      | changed from 1.75 (ADR-0005 amended)     |
| IconButton 44 / 48          | `size.touch-target.min` / `.preferred`                    | 44 / 48    | none                                     |
| Sidebar / rail              | `layout.sidebar-expanded` / `collapsed`                   | 248 / 76   | none                                     |
| Top bar desktop / mobile    | `layout.topbar-height` / `-compact`                       | 68 / 56    | none                                     |
| Bottom navigation           | `layout.bottom-nav-height`                                | **80**     | changed from 64                          |
| Modal width                 | `layout.dialog-width`                                     | 560 px     | new                                      |

Breakpoints stay (`md` 768, `lg` 1024, `xl` 1280). The Figma viewports are 390, 768 and 1440.

### 5.3 Elevation and motion

V3 is flat: surface contrast and borders, no blur or glass ("No native glass or background blur is required"). Keep
`shadow.0–3` for overlays (dialog, sheet, popover, toast) only, with a dark-theme override that uses a black alpha
instead of navy. Motion tokens stay. Motion is optional; every animated state has a static equivalent, and
`prefers-reduced-motion` turns animation off.

## 6. Design-time translation

Figma variable names carry a `v3/` prefix (`v3/text/primary`, `v3/state/success/background`); spacing, radius, icon,
control and layout variables do not (`space/2`, `radius/card`, `icon/stroke`, `control/regular`). Text styles are
named `Atlas/V3/<Role>`. The tables in §2–§5 record the mapping from these names to JSON paths and CSS names.

Figma-to-code translation is a **development-time, reviewed activity** ([ADR-0010](../adr/0010-figma-visual-source-of-truth.md)).
There is no sync script, mapping file, variable snapshot or CI drift check, and the build never calls Figma.

1. A designer changes a variable in Figma and tells the team (design freeze per roadmap phase gate).
2. A developer, assisted by Copilot, reads the variables with `get_variable_defs` (Figma MCP) in Dark and Light mode
   and updates the tables in this document.
3. The developer updates `design/tokens/*.json`, runs `npm run tokens:build`, and adds or updates pairs in
   `contrast-pairs.json`.
4. `npm run verify` must stay green (contrast gate included). If Figma ships a pair below AA, the PR stops and the
   conflict is reported for a design decision; code never silently "fixes" a Figma value.
5. The PR names the Figma nodes and variables it follows.

## 7. Contrast

Computed on 2026-11-14 with the WCAG 2.x formula. All Figma text pairs pass AA. These pairs replace the obsolete ones
in `contrast-pairs.json`.

| Pair                                    | Dark           | Light             | Needed |
| --------------------------------------- | -------------- | ----------------- | ------ |
| text/primary on page                    | 17.66          | 13.77             | 4.5    |
| text/primary on card                    | 13.23          | 14.78             | 4.5    |
| text/secondary on card                  | 6.80           | 5.92              | 4.5    |
| text/secondary on raised                | 5.92           | 5.15              | 4.5    |
| on-action on action/primary             | 7.10           | 6.28              | 4.5    |
| on-action on action/hover               | 5.28           | 7.61              | 4.5    |
| disabled label on disabled              | 5.92           | 5.15              | info   |
| text/achievement on achievement surface | 7.11           | 5.79              | 4.5    |
| border/control on card                  | 4.40           | 3.58              | 3.0    |
| border/control on page / raised         | 5.88 / 3.84    | 3.34 / 3.12       | 3.0    |
| focus ring on page                      | 8.41           | 6.29              | 3.0    |
| progress fill on track                  | 3.43           | 4.88              | 3.0    |
| dimension fg on its tint (lowest)       | 6.43 (passion) | 4.52 (friendship) | 4.5    |
| state fg on its tint (lowest)           | 5.92 (neutral) | 4.74 (active)     | 4.5    |

`light-gold` `#A17A3F` on white (3.91) is the only primitive below 4.5 and is marked decorative.

## 8. Implementation order

1. **ADR-0010** (accepted 2026-11-14): Figma is the visual source at design time; amends ADR-0005 and ADR-0007.
2. One PR (roadmap phase 2, item T-1): replace primitives and semantics in `colors.json`, add new roles, update
   `contrast-pairs.json`, `_theme.scss` and `_theme-colors.scss` (re-run `ng generate @angular/material:theme-color`
   with jade `#205D55` as the primary seed), regenerate, update `design-foundation` and the Playwright/axe checks.
3. One PR (T-2): Manrope font, `font.heading`, `font-weight.bold`, `typescale.control`, remove DM Serif; update
   notices and the license matrix.
4. One PR (T-3): `size.icon-stroke: 2`, the registry glyph changes in [component-mapping.md §2](component-mapping.md#2-icons),
   `icons:sync`.
