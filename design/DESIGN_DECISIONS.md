# Design decisions

This log records the design-system decisions taken while building design steps 1–3 (brand assets, tokens and the
Angular theme foundation). Each entry gives the context, the decision, the rationale, the consequences and a status.
Architecture-level decisions are in [`../docs/adr/`](../docs/adr/). The entries below link to them where relevant and do
not repeat them.

**Status values:**

- **Accepted** means the decision is implemented and verified.
- **Accepted (draft)** means it is implemented but not yet exposed to users.
- **Specified** means it is decided for a later step but not built yet.
- **Open** means a known issue or an unresolved question.

| ID                                                                       | Decision                                                 | Status           |
| ------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------- |
| [DD-01](#dd-01-design-tokens-are-the-single-source-of-truth)             | Design tokens are the single source of truth             | Accepted         |
| [DD-02](#dd-02-token-format-naming-and-theme-selectors)                  | Token format, naming and theme selectors                 | Accepted         |
| [DD-03](#dd-03-ui-vocabulary-maps-onto-the-domain-model)                 | UI vocabulary maps onto the domain model                 | Accepted         |
| [DD-04](#dd-04-life-dimension-keys-and-canonical-order)                  | Life Dimension keys and canonical order                  | Accepted         |
| [DD-05](#dd-05-tabler-icons-instead-of-lucide)                           | Tabler Icons instead of Lucide                           | Accepted         |
| [DD-06](#dd-06-logo-concept-heptagon-route-with-a-compass-needle)        | Logo concept: heptagon route with a compass needle       | Superseded       |
| [DD-07](#dd-07-muted-text-uses-neutral-600)                              | Muted text uses neutral-600                              | Accepted         |
| [DD-08](#dd-08-status-is-never-conveyed-by-colour-alone)                 | Status is never conveyed by colour alone                 | Accepted         |
| [DD-09](#dd-09-dimension-accents-are-decorative-on-light-surfaces)       | Dimension accents are decorative on light surfaces       | Accepted         |
| [DD-10](#dd-10-in-progress-status-equals-career-strong)                  | In-progress status equals Career strong                  | Accepted         |
| [DD-11](#dd-11-gold-usage-tiers)                                         | Gold usage tiers                                         | Accepted         |
| [DD-12](#dd-12-dark-control-border-is-a-non-text-element)                | Dark control border is a non-text element                | Accepted (draft) |
| [DD-13](#dd-13-dark-theme-is-a-preview-not-a-user-setting)               | Dark theme is a preview, not a user setting              | Accepted (draft) |
| [DD-14](#dd-14-self-hosted-fonts-and-no-runtime-urls)                    | Self-hosted fonts and no runtime URLs                    | Accepted         |
| [DD-15](#dd-15-display-type-uses-weight-400-without-synthesis)           | Display type uses weight 400 without synthesis           | Accepted         |
| [DD-16](#dd-16-angular-material-m3-mapped-onto-atlas-tokens)             | Angular Material M3 mapped onto Atlas tokens             | Accepted         |
| [DD-17](#dd-17-raster-exports-are-derived-and-validated-by-properties)   | Raster exports are derived and validated by properties   | Accepted         |
| [DD-18](#dd-18-splash-exports-live-in-exportscapacitor)                  | Splash exports live in `exports/capacitor`               | Accepted         |
| [DD-19](#dd-19-motion-tokens-and-reduced-motion)                         | Motion tokens and reduced motion                         | Accepted         |
| [DD-20](#dd-20-focus-indicators)                                         | Focus indicators                                         | Accepted         |
| [DD-21](#dd-21-links-are-always-underlined)                              | Links are always underlined                              | Accepted         |
| [DD-22](#dd-22-layout-token-additions)                                   | Layout token additions                                   | Accepted         |
| [DD-23](#dd-23-brand-masters-are-served-at-brand)                        | Brand masters are served at `/brand`                     | Accepted         |
| [DD-24](#dd-24-the-in-app-logo-renders-live-text)                        | The in-app logo renders live text                        | Accepted         |
| [DD-25](#dd-25-critical-css-inlining-disabled-for-csp)                   | Critical-CSS inlining disabled for CSP                   | Accepted         |
| [DD-26](#dd-26-zoneless-angular-with-onpush-defaults)                    | Zoneless Angular with OnPush defaults                    | Accepted         |
| [DD-27](#dd-27-no-hex-colours-in-component-styles)                       | No hex colours in component styles                       | Accepted         |
| [DD-28](#dd-28-sass-abstracts-module-and-global-type-classes)            | Sass abstracts module and global type classes            | Accepted         |
| [DD-29](#dd-29-mobile-bottom-navigation-holds-five-items-including-more) | Mobile bottom navigation holds five items including More | Specified        |
| [DD-30](#dd-30-wireframes-are-static-svg-not-pixel-specs)                | Wireframes are static SVG, not pixel specs               | Accepted         |
| [DD-31](#dd-31-one-mock-dataset)                                         | One mock dataset                                         | Open             |
| [DD-32](#dd-32-cdk-overlay-container-uses-the-overlay-layer)             | CDK overlay container uses the overlay layer             | Accepted         |
| [DD-33](#dd-33-logo-symbol-is-the-figma-v3-cardinal-ikigai-venn)         | Logo symbol is the Figma V3 cardinal Ikigai Venn         | Accepted         |

---

### DD-01: Design tokens are the single source of truth

- **Context:** Design-instructions §0 rule 5 and §10 require one token source. Colour, type, spacing, radius, shadow and
  motion values must not be scattered through the code.
- **Decision:** The JSON in `design/tokens/` is authoritative. `npm run tokens:build`
  (`scripts/design-tokens/build-tokens.mjs`, plain Node) generates three files:
  - `src/styles/tokens/_tokens.generated.scss`
  - `src/styles/tokens/_breakpoints.generated.scss`
  - `src/app/shared/design-system/tokens.generated.ts`

  `npm run tokens:check` fails CI on drift. See
  [ADR-0007](../docs/adr/0007-design-tokens-source-of-truth.md).

- **Rationale:** One editable source serves SCSS, TypeScript (charts later) and design tooling, and the check makes
  drift visible.
- **Consequences:** Generated files are committed and never edited by hand. A token change ships together with its
  regenerated outputs and, where relevant, a new pair in `contrast-pairs.json`.
- **Status:** Accepted, implemented.

### DD-02: Token format, naming and theme selectors

- **Context:** The specification lists six token files and example CSS variables (§10). It does not define a file
  format.
- **Decision:**
  - **Format:** W3C Design Tokens Community Group draft format (`$value`, `$type`, `$description`, `{alias}`
    references). A `DEFAULT` key collapses into its parent name.
  - **Naming:** the CSS variable is the path joined with `-`, for example `--color-text-muted`,
    `--color-dimension-career-strong`, `--typescale-h1-font-size`, `--layout-sidebar-expanded` and `--z-modal`.
  - **Extra files:** `layout.json` (breakpoints, shell sizes, grid, z-index) and `contrast-pairs.json` (pairs to
    check, not part of the token tree). The `design-tokens.json` manifest also carries `lifeDimensions` metadata
    (order, labels, icons).
  - **Selectors:** light semantic values on `:root`. Dark overrides on `[data-theme='dark']`, which also sets
    `color-scheme: dark`. The desktop type scale sits in `@media (min-width: 768px)`.
- **Rationale:** It is a vendor-neutral, documented format, and its names stay predictable for both people and tools.
- **Consequences:** Components use semantic tokens such as `--color-text-secondary`, not primitives such as
  `--color-brand-neutral-700`.
- **Status:** Accepted, implemented.

### DD-03: UI vocabulary maps onto the domain model

- **Context:** The product uses journey language while the API uses goal-planning terms.
- **Decision:** The terms map as follows (see [ADR-0006](../docs/adr/0006-ui-vocabulary-and-domain-mapping.md)):

  | UI term          | Domain term                       |
  | ---------------- | --------------------------------- |
  | My Atlas         | Dashboard                         |
  | Destination      | Goal                              |
  | Waypoint         | GoalNode `MILESTONE`/`CHECKPOINT` |
  | Step             | GoalNode `TASK`                   |
  | Connection       | GoalLink / GoalNodeDependency     |
  | Journey Overview | timeline read model               |
  | Milestone Award  | GoalReward                        |
  | Life Dimension   | Ikigai area                       |

- **Rationale:** User-facing copy stays consistent while the API stays conventional.
- **Consequences:** Navigation labels, page titles, icons in the `ATLAS_ICONS` registry and the mock-ups use the UI
  terms. Data-access code keeps the API terms.
- **Status:** Accepted.

### DD-04: Life Dimension keys and canonical order

- **Context:**
  - Design-instructions §2.2 and §7.8 order the dimensions Career, Finance, Health, Love, Passion, Friendship, Family.
  - Project-instruction §4 lists Profession, Passion, Finance, Love, Health, Friendship, Family.
- **Decision:**
  - **Keys:** `CAREER`, `FINANCE`, `HEALTH`, `LOVE`, `PASSION`, `FRIENDSHIP`, `FAMILY`. They are upper case in the API
    and lower case in tokens, CSS and file names.
  - **Order:** the canonical display order is the design-instructions order. It also runs clockwise from north around
    the logo's seven nodes.
  - **Labels:** long labels "Career / Profession" and "Love / Partnership".
  - **Single source:** all of the above live in `design/tokens/design-tokens.json → lifeDimensions`, with the runtime
    registry `LIFE_DIMENSIONS` in `src/app/shared/design-system/life-dimensions.ts`.
- **Rationale:** One fixed order keeps charts, cards and the logo aligned. "Career" is shorter in navigation, and the
  long label keeps the "Profession" meaning.
- **Consequences:** Seed data and the backend should use the same keys. User reordering (project-instruction §4) is a
  later feature and must not change the keys.
- **Status:** Accepted.

### DD-05: Tabler Icons instead of Lucide

- **Context:** Design-instructions §5.1 suggests Lucide. Project-instruction §9.1 names Tabler. The owner chose Tabler.
- **Decision:**
  - Use `@tabler/icons-angular` 3.51 (MIT), **outline only**, with stroke **1.75**. Sizes are `xs` 16, `sm` 18,
    `md` 20 and `lg` 24 px.
  - Features use `<atlas-icon name="…">` with a semantic name from `ATLAS_ICONS`
    (`src/app/shared/icons/atlas-icons.ts`).
  - The seven dimension SVGs are generated from `@tabler/icons` by `npm run icons:sync`.
  - See [ADR-0005](../docs/adr/0005-icon-library-tabler.md).
- **Substitutions** where the Lucide name has no direct Tabler equivalent:

  | Lucide (spec)                               | Tabler                   |
  | ------------------------------------------- | ------------------------ |
  | `list-checks`                               | `list-check`             |
  | `network`                                   | `affiliate`              |
  | `orbit` / `circle-dot`                      | `circle-dot`             |
  | `briefcase-business`                        | `briefcase`              |
  | `heart-pulse`                               | `heartbeat`              |
  | `house`                                     | `home`                   |
  | `trash-2`                                   | `trash`                  |
  | `notebook-pen`                              | `notebook`               |
  | `calendar-days`                             | `calendar-event`         |
  | `sliders-horizontal` (no Tabler equivalent) | `adjustments-horizontal` |
  | `check-circle-2`                            | `circle-check`           |
  | `maximize-2` / `chevron-right`              | `chevron-right`          |

- **Rationale:** Tabler is a large, consistent, tree-shakable MIT outline family. The semantic registry means a glyph
  changes in one place. For Health, `heartbeat` was chosen over `heart-rate-monitor` because the latter reads as a
  monitor screen. `heartbeat` stays closest to the spec's `heart-pulse`.
- **Consequences:**
  - The spec's Lucide names do not apply directly; the registry is the reference.
  - Unknown icon names fail type-checking (`AtlasIconName`).
  - `npm run icons:check` detects drift in the dimension SVGs.
- **Status:** Accepted, implemented.

### DD-06: Logo concept: heptagon route with a compass needle

- **Context:** Design-instructions §1.3 asks for:
  - a geometric compass or atlas symbol with seven connected waypoint nodes around a central point, where the outer
    points are the Life Dimensions and the centre is the person and their purpose;
  - legibility at 16–24 px and in one colour;
  - no resemblance to a location pin, navigation app or cryptocurrency logo.
- **Decision:** Concept "variant B":
  - A closed heptagon route with seven waypoint nodes stands for the seven Life Dimensions, clockwise from north.
  - A two-tone compass needle stands for the person and their purpose. Gold points north, navy points south.
  - The mark is optically centred at `cy = 33` in a 64 viewBox.

  Geometry and variants are in [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md).

- **Rationale:** A closed route reads as a journey with stops. An **open-ring** variant was rejected because it read as
  a power icon.
- **Consequences:** §1.3 asks for legibility at 16–24 px, which is only partly met. At 16 px the nodes merge into a
  toothed ring, though the two-tone needle stays legible. 16 px is therefore limited to favicon and tab use
  ([minimum sizes](BRAND_GUIDELINES.md#minimum-sizes)).
- **Status:** Superseded by [DD-33](#dd-33-logo-symbol-is-the-figma-v3-cardinal-ikigai-venn).

### DD-07: Muted text uses neutral-600

- **Context:** Design-instructions §2.1 marks `neutral-500 #747E89` as "Muted metadata; verify contrast", and §10.2
  sets `--color-text-muted: #747E89`. On white this gives 4.13:1, which fails the 4.5:1 text threshold.
- **Decision:**
  - Add **`neutral-600 #5F6873`**, marked as an Atlas addition in `colors.json`, as `--color-text-muted`. It gives
    5.65:1 on white and 4.98:1 on ivory-100.
  - Restrict `neutral-500` to non-text and disabled use: control borders and the not-started status icon.
- **Rationale:** Keeps the spec's visual hierarchy while meeting WCAG 1.4.3.
- **Consequences:** This deviates from §10.2. The contrast check carries an `info` row that documents the limitation.
- **Status:** Accepted.

### DD-08: Status is never conveyed by colour alone

- **Context:** Design-instructions §2.3 and §11 require status that does not depend on colour. Some status colours
  (upcoming 4.01:1, at-risk 4.07:1 on white) are below the text threshold.
- **Decision:**
  - Status colours are used for **icons and dots** only, which need 3:1 for non-text. Status **labels** use
    `--color-text-secondary`.
  - Every status pairs an icon with a label through `ATLAS_STATUSES` (`src/app/shared/design-system/statuses.ts`):
    Completed, In progress, Upcoming, At risk, Blocked and Not started.
  - On dark surfaces, `status-on-dark` tokens apply. These are Atlas additions: each status colour mixed 45% with
    ivory-50, all ≥ 5.2:1 on midnight-800.
- **Rationale:** Meets WCAG 1.4.1 and 1.4.11 and keeps the specified hues.
- **Consequences:** Components must never render a status as colour only, for example a bare coloured dot.
- **Status:** Accepted.

### DD-09: Dimension accents are decorative on light surfaces

- **Context:** The pastel accents in design-instructions §2.2 reach only 2.09–2.83:1 on white.
- **Decision:**
  - On light surfaces the accent is decorative only: fills, tints and chart areas.
  - Meaningful marks use the **`-strong`** variant (≥ 4.5:1 on white and on its tint) or sit next to a text label.
  - On dark surfaces the accent itself passes (≥ 5.5:1 on midnight-900). In the dark theme
    `--color-dimension-*-strong` resolves to the accent and `-tint` resolves to midnight-800.
- **Rationale:** Keeps the calm palette and stays compliant.
- **Consequences:** Charts (planned) need strong outlines or labels. The `symbol-dimensions` logo variant is for marketing
  use at ≥ 48 px only.
- **Status:** Accepted.

### DD-10: In-progress status equals Career strong

- **Context:** The spec's in-progress colour `#426D9B` is identical to the Career strong colour.
- **Decision:** Keep the spec values. Status is always paired with its icon (`progress`) and label, and dimensions are
  always paired with their icon and name.
- **Rationale:** Changing either value would deviate from the brand palette for little gain once colour is never the
  only signal ([DD-08](#dd-08-status-is-never-conveyed-by-colour-alone)).
- **Consequences:** Avoid placing an in-progress dot directly beside a Career accent without labels.
- **Status:** Accepted.

### DD-11: Gold usage tiers

- **Context:** Design-instructions §2.1 says gold is an accent and that small gold text on light surfaces should use
  `#805B2F` or `#765329`. Those two values are not in the palette table.
- **Decision:** `gold-800 #805B2F` and `gold-900 #765329` are added to the scale.

  | Use                                      | Token                                      | Contrast        |
  | ---------------------------------------- | ------------------------------------------ | --------------- |
  | Small gold text on light surfaces        | `gold-800`                                 | 6.08:1 on white |
  | Large gold text and non-text marks       | `gold-700`                                 | 3.75:1 on white |
  | Decorative accent on light               | `gold-600`                                 | 3.01:1          |
  | On navy: focus ring, nav indicator, text | `gold-500`                                 | 7.48:1          |
  | Achievement surface                      | `gold-200` (`--color-surface-achievement`) |                 |

- **Rationale:** This is the spec's own guidance, made into tokens.
- **Consequences:** `--color-text-achievement` is `gold-800`.
- **Status:** Accepted.

### DD-12: Dark control border is a non-text element

- **Context:** In the dark draft, the control border is `neutral-500` on `midnight-900`, which gives 3.79:1.
- **Decision:** Classify it as a non-text UI component (WCAG 1.4.11, 3:1). It passes.
- **Rationale:** Borders identify controls. They are not text.
- **Consequences:** Do not reuse that pairing for text.
- **Status:** Accepted (draft, as part of the dark theme).

### DD-13: Dark theme is a preview, not a user setting

- **Context:** Design-instructions §2.4 calls the dark theme a later enhancement. It still asks for semantic tokens for
  both themes from the start: navy variations rather than black, no simple inversion, and contrast verified for every
  role.
- **Decision:**
  - The dark theme exists as tokens (`[data-theme='dark']`, marked draft in `design-tokens.json`) and as a Material
    dark mapping.
  - The `AtlasTheme` service sets `data-theme` on `<html>`, and the design-foundation page has a toggle to preview it.
  - Users cannot select it yet: there is no persistence and no system-preference policy. That arrives with Settings
    (step 4 onward). See ADR-0007 on the user-preference policy.
- **Rationale:** Validates contrast and Material mapping early without committing to UX behaviour.
- **Consequences:** `index.html` declares `color-scheme: light`. Axe runs in both themes (`e2e/design-foundation.spec.ts`).
- **Status:** Accepted (draft).

### DD-14: Self-hosted fonts and no runtime URLs

- **Context:** Design-instructions §3.1 recommends Inter and DM Serif Display, bundled locally with no font CDNs. §16
  forbids external image and font URLs at runtime.
- **Decision:**
  - Use `@fontsource-variable/inter` 5.3.0 (Inter Variable) and `@fontsource/dm-serif-display` 5.3.0. Both are SIL OFL
    1.1 and are bundled by the Angular build, so no CDN is involved.
  - The sans stack is `"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- **Rationale:** Offline-capable in Capacitor, works under a strict CSP, and leaks no privacy data to font CDNs.
- **Consequences:** Font files are part of the bundle. Weights are limited to 400, 500 and 600.
- **Status:** Accepted.

### DD-15: Display type uses weight 400 without synthesis

- **Context:** Design-instructions §3.2 specifies Display at weight 500–600. DM Serif Display ships one weight (400).
- **Decision:** The `typescale.display` token uses 400. `atlas.style(display)` and `.atlas-display` set
  `font-synthesis: none`.
- **Rationale:** Synthetic bold distorts the face. Its high contrast already gives display presence.
- **Consequences:** This deviates from §3.2, as documented in the token `$description`.
- **Status:** Accepted.

### DD-16: Angular Material M3 mapped onto Atlas tokens

- **Context:** Angular Material 22 is installed (ADR-0003). Its default colours must not leak into the product
  (design-instructions §17, Prompt 3).
- **Decision:** `src/styles/material/_theme.scss` applies the M3 theme in four layers:
  1. **Palettes.** `mat.theme` uses palettes generated by `ng generate @angular/material:theme-color` from primary
     `#14243A`, secondary `#304A65`, tertiary `#B88D52`, neutral `#747E89` and error `#A65353`
     (`_theme-colors.scss`).
  2. **System tokens.** These are overridden with Atlas CSS variables, so Material renders exact brand values.
     Container roles map to warm Atlas surfaces (`surface-subtle` and `surface-achievement`), and `inverse-primary`
     maps to gold-500.
  3. **Typography and shape.** Typography uses `var(--font-sans)` at 600, 500 and 400, with density 0. Buttons use
     `radius-sm` (8), cards use `radius-md` (12) with a `border-subtle` outline, and dialogs use `radius-lg` (16).
  4. **Focus and contrast.** `mat.strong-focus-indicators` draws a 2px solid outline with a 4px radius.
     `prefers-contrast: more` applies Material's high-contrast overrides in the light theme only.
- **Rationale:** Material supplies accessible behaviour, and the tokens supply the brand.
- **Consequences:** `_theme-colors.scss` is produced by the Material schematic, **not** by `tokens:build`. If a brand
  primary changes, re-run the schematic.
- **Status:** Accepted.

### DD-17: Raster exports are derived and validated by properties

- **Context:** Design-instructions §0 rule 9 and §12 say never to rasterise masters by hand and to make exports
  reproducible.
- **Decision:**
  - `npm run assets:export` renders every raster from its SVG master with sharp 0.35.5 (libvips 8.18.7, librsvg 2.63.2).
    It uses density-based rendering, sRGB output and PNG compression 9.
  - `npm run assets:validate` checks dimensions, alpha, colour space and SVG safety.
- **Rationale:** Library versions differ across machines, so PNG bytes can differ even when the render is visually
  identical.
- **Consequences:** Outputs are reproducible but **not byte-identical** across platforms. Validation checks properties,
  not hashes. See [ASSET_EXPORTS.md](ASSET_EXPORTS.md).
- **Status:** Accepted.

### DD-18: Splash exports live in `exports/capacitor`

- **Context:** Design-instructions §0 lists `design/exports/splash/`. `@capacitor/assets` expects `icon-*.png` and
  `splash*.png` together in one input folder.
- **Decision:** `splash.png` and `splash-dark.png` (2732², identical content) live in `design/exports/capacitor/`.
- **Rationale:** `npx @capacitor/assets generate --assetPath design/exports/capacitor` can then run with no copying.
- **Consequences:** The [README folder map](README.md#folder-map) documents the mapping.
- **Status:** Accepted.

### DD-19: Motion tokens and reduced motion

- **Context:** Design-instructions §4.4 gives these ranges: micro 120–160 ms, standard 180–240 ms, page 240–320 ms.
  Entrances use ease-out and state changes use ease-in-out.
- **Decision:**
  - **Durations:** `instant` 0, `micro` 140 ms, `standard` 200 ms, `page` 280 ms.
  - **Easings:** `enter` `cubic-bezier(0.2, 0, 0, 1)`, `exit` `cubic-bezier(0.4, 0, 1, 1)`, `standard`
    `cubic-bezier(0.4, 0, 0.2, 1)`.
  - **Reduced motion:** under `prefers-reduced-motion: reduce`, base CSS zeroes the duration tokens and clamps
    transitions and animations to 0.01 ms. Angular Material disables its own animations automatically.
- **Rationale:** Values sit mid-range. One media query covers both custom and Material motion.
- **Consequences:** Components must animate through the duration tokens so the reduced-motion override applies.
- **Status:** Accepted.

### DD-20: Focus indicators

- **Context:** WCAG 2.4.7 and 2.4.13, plus design-instructions §11.
- **Decision:**
  - **Default ring:** `atlas.focus-ring` draws a 2px outline (`--size-focus-ring-width`) with a 2px offset in
    `--color-focus-ring`, which is midnight-900 in light and gold-500 in dark.
  - **Inverse surfaces:** inside `[data-surface='inverse']` (sidebar, hero, bottom navigation) the ring is gold-500.
  - **Forced colours:** the ring uses `Highlight` under `forced-colors: active`.
  - **Material:** components use strong focus indicators ([DD-16](#dd-16-angular-material-m3-mapped-onto-atlas-tokens)).
- **Rationale:** The ring stays visible on every surface: 14.86:1 on ivory and 7.48:1 for gold on navy.
- **Consequences:** Navy containers must set `data-surface="inverse"`.
- **Status:** Accepted.

### DD-21: Links are always underlined

- **Decision:** Links use `--color-text-link` (midnight-800, 12.32:1 on white) and are always underlined, with a 1px
  underline at a 0.2em offset.
- **Rationale:** WCAG 1.4.1. Navy links are close to body text in colour.
- **Status:** Accepted.

### DD-22: Layout token additions

- **Context:** Design-instructions §4.1 already specifies most shell values:
  - sidebar 248 expanded and 76 collapsed;
  - top bar 68, or 56 when compact;
  - padding 32/24/24/16, content max 1440, reading width 840;
  - 12, 8 and 4 grid columns.

  It defines neither a bottom-navigation height nor a stacking order.

- **Decision:** `layout.json` tokenises the §4.1 values and adds two Atlas values:
  - **Bottom navigation:** 64 px, excluding the safe area.
  - **z-index scale:** base 0 → raised 10 → sticky 100 → navigation 200 → topbar 300 → drawer 400 → overlay 500 →
    modal 600 → popover 700 → toast 800 → tooltip 900.
- **Rationale:** The shell (step 4) needs agreed numbers before it is built.
- **Consequences:** See [RESPONSIVE_BEHAVIOR.md](RESPONSIVE_BEHAVIOR.md). The CDK overlay container uses the overlay layer
  ([DD-32](#dd-32-cdk-overlay-container-uses-the-overlay-layer)).
- **Status:** Accepted (tokens). The shell itself is Specified.

### DD-23: Brand masters are served at `/brand`

- **Decision:** `angular.json` copies `design/svg/logo/ikigai-atlas-*.svg` to `/brand/`, excluding `*app-icon*` and
  `*splash*`.
- **Rationale:** Masters stay single-sourced and can be used for e-mail, about pages and marketing without copying them.
- **Status:** Accepted.

### DD-24: The in-app logo renders live text

- **Decision:** `<atlas-logo>` inlines the symbol as SVG and renders "IKIGAI ATLAS" as live text in Inter 600. It
  follows the dark theme through `:host-context([data-theme='dark'])` and has a forced-colours fallback.
- **Rationale:** Live text is crisp, themeable and needs no image request. The SVG wordmark masters keep an editable
  `<text>` element (`textLength` 203 at 26 px) for design use.
- **Consequences:** Outlined-text wordmarks for print and marketing are **not** produced yet (to verify whether they are
  needed).
- **Status:** Accepted.

### DD-25: Critical-CSS inlining disabled for CSP

- **Decision:** Production builds set `optimization.styles.inlineCritical: false` in `angular.json`.
- **Rationale:** Critical-CSS inlining loads the remaining stylesheet through inline JavaScript. That would conflict with
  the nginx policy `script-src 'self'`. The exact mechanism depends on the Angular version (to verify if this is
  revisited).
- **Consequences:** Slightly later first paint of non-critical styles. The trade-off is accepted.
- **Status:** Accepted.

### DD-26: Zoneless Angular with OnPush defaults

- **Decision:** Angular 22.2 runs zoneless (no `zone.js` in the project) with OnPush components by default. Primitives
  use signals (`input()`, `signal()`).
- **Rationale:** These are the framework defaults, with predictable change detection.
- **Status:** Accepted.

### DD-27: No hex colours in component styles

- **Decision:** `.stylelintrc.json` forbids hex colours in `src/app/**`. Components use `var(--color-…)`.
- **Rationale:** This enforces [DD-01](#dd-01-design-tokens-are-the-single-source-of-truth) at lint time.
- **Status:** Accepted.

### DD-28: Sass abstracts module and global type classes

- **Decision:**
  - Components write `@use 'abstracts' as atlas;`, which resolves through `angular.json` `includePaths: ['src/styles']`.
  - The module provides `atlas.up/down/between(bp)`, `atlas.bp()`, `atlas.style(name)`, `atlas.tabular-numbers`,
    `atlas.truncate`, `atlas.visually-hidden`, `atlas.focus-ring()` and `atlas.touch-target`.
  - Global classes: `.atlas-display`, `.atlas-h1` to `.atlas-h4`, `.atlas-body-large`, `.atlas-body`, `.atlas-label`,
    `.atlas-caption`, `.atlas-metric`, `.atlas-tabular`, `.atlas-text-secondary`, `.atlas-text-muted`,
    `.atlas-visually-hidden` and `.atlas-skip-link`.
- **Rationale:** Mixins emit only `var()` references, so a component's CSS stays small (component budget: 4 kB warning,
  8 kB error).
- **Status:** Accepted.

### DD-29: Mobile bottom navigation holds five items including More

- **Context:** Design-instructions §6.4 allows at most five bottom-navigation items.
- **Decision:** The items are My Atlas, Destinations, Journey, Awards and **More**. More exposes Waypoints, Steps,
  Connections and Life Dimensions. Quick add sits in the mobile top bar, not in a floating action button.
- **Rationale:** Respects the five-item limit and keeps content unobstructed.
- **Consequences:** `design/mockups/app-shell-mobile.svg` follows this layout.
- **Status:** Specified (step 4).

### DD-30: Wireframes are static SVG, not pixel specs

- **Decision:** `design/mockups/app-shell-{desktop,mobile}.svg` are hand-editable low- and mid-fidelity wireframes.
  - They use token hex values only and live `<text>`.
  - Icons are Tabler outline glyphs inlined as `<symbol>` with MIT attribution.
  - They contain no `<image>`, no external `href` and no script.
  - They are not part of the raster asset manifest.
- **Rationale:** They communicate structure. The tokens and components are the specification.
- **Status:** Accepted.

### DD-31: One mock dataset

- **Context:** Design-instructions §0 and §14, and project-instruction §10.5, allow exactly **one** sample Destination:
  "Complete an online Master's degree in Computer Science / AI".
- **Decision:** All docs, mock-ups and future page templates use only this dataset.
- **Open issues:**
  - Resolved 2026-11-12: the temporary design-foundation page now uses this dataset too (its earlier "Run a half
    marathon" sample was replaced).
  - Design-instructions §14 also asks to "show one cross-goal Connection", which needs a second goal and so conflicts
    with project-instruction §10.5. This is to be resolved by the owner.
- **Status:** Open.

### DD-32: CDK overlay container uses the overlay layer

- **Context:** `layout.json` describes `z.overlay` (500) as the layer for the Angular CDK overlay container. The CDK
  default is 1000, above the whole Atlas scale.
- **Decision:** `src/styles/material/_theme.scss` sets `.cdk-overlay-container { z-index: var(--z-overlay) }`. CDK 22
  declares its value inside `@layer cdk-overlay`, so the unlayered Atlas rule wins regardless of load order. Panes,
  global wrappers and backdrops keep their CDK values because they stack inside the container.
- **Consequences:**
  - CDK overlays (dialogs, menus, select panels, tooltips, snack bars) sit above the top bar (300) and drawer (400).
  - Among themselves they stack in creation order.
  - The `modal`, `popover`, `toast` and `tooltip` tokens apply only to layers built outside the CDK. Revisit this if
    `atlas-toast` becomes a custom overlay (step 5).
- **Status:** Accepted, implemented.

### DD-33: Logo symbol is the Figma V3 cardinal Ikigai Venn

- **Context:** The approved Figma file "IKIGAI ATLAS — Complete Product Design", page "15.Export Assets" (node
  `214:1732`), replaces the heptagon/needle mark with a "cardinal Ikigai Venn": four r48 circles centred at (80, 52),
  (52, 80), (108, 80) and (80, 108) on a 160 grid. The shared centre is formed by overlap only. The same page uses a
  V3 palette (`#0B1020` backgrounds) and a Manrope Bold wordmark that the repo does not have.
- **Decision:**
  - Adopt the symbol geometry and its four circle colours. They are tokens `color.brand.venn.{blue,teal,violet,rose}`
    (`#5685B5`, `#348F84`, `#8A73BB`, `#B17D9E`). The masters use the 64 grid (scale 0.4: r 19.2, centres (32, 20.8),
    (20.8, 32), (43.2, 32), (32, 43.2)), so every lockup layout is unchanged.
  - Blend as in Figma: `multiply` at 72 % opacity on light, `screen` at 82 % on dark. Single-colour variants use
    outlines so the overlaps stay visible; `symbol-dimensions` is the Figma colour fine-line variant.
  - Keep the repo navy `#14243A` for the app icon and splash and keep the Inter 600 wordmark. The V3 palette and
    Manrope are not adopted.
  - App icon: a 640 px symbol box with a 192 px inset on 1024, as in the Figma master (160 on 256 at 4×).
- **Consequences:** The seven Life Dimensions are no longer encoded in the mark, which departs from design-instructions
  §1.3. The full-colour symbol stays recognisable at 16 px; the monochrome outline needs 24 px.
- **Status:** Accepted, implemented (17 masters in `design/svg/logo/`, derived rasters re-exported, `<atlas-logo>`
  updated).
