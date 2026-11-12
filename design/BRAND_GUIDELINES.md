# Brand guidelines

Status: **Implemented** (design step 1). The masters are in `design/svg/logo/`. The rules below are verified against
those files, and the minimum sizes were checked by rendering.

## Essence

From design-instructions §1.1:

> IKIGAI ATLAS helps a person see their whole life, understand how goals connect, and make deliberate progress without
> being overwhelmed.

- **Attributes:** intentional, ambitious, intelligent, optimistic, premium, human, structured, calm.
- **Main tagline:** _See the whole. Shape what matters._ Use it in onboarding, app-store marketing and brand materials
  only, not on every screen.
- **Supporting line:** _Your life, mapped with purpose._

### Visual metaphor (§1.2)

Modern cartography, used sparingly:

| Product concept  | Cartographic meaning    |
| ---------------- | ----------------------- |
| The whole life   | The atlas               |
| Life Dimensions  | Regions                 |
| Destinations     | Meaningful outcomes     |
| Waypoints        | Milestones              |
| Steps            | Actionable tasks        |
| Connections      | Dependencies and impact |
| Journey Overview | Movement over time      |
| Milestone Awards | Meaningful progress     |

Route lines, waypoint dots, map-grid references and contour-like curves support hierarchy. They must never become
decorative noise.

## Logo anatomy

![Symbol](svg/logo/ikigai-atlas-symbol.svg)

| Element      | Meaning                                                                                                     | Geometry (64 × 64 viewBox)                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Route        | The whole life as one connected journey                                                                     | Closed heptagon, radius 22 around (32, 33), stroke 3.25, round joins                                                             |
| Seven nodes  | The seven Life Dimensions, clockwise from north: Career, Finance, Health, Love, Passion, Friendship, Family | Circles r = 4.5 on the heptagon vertices                                                                                         |
| Needle north | The person's purpose and direction (gold)                                                                   | `M32 18 38 33H26Z`                                                                                                               |
| Needle south | Grounding (navy)                                                                                            | `M26 33H38L32 46Z`. In single-colour variants the south half is an outline (`M27 33H37L32 45Z`, stroke 2), so it stays distinct. |

The mark is **optically centred**. A heptagon with a vertex at the top is top-heavy around its circumcentre. Placing the
circumcentre at `cy = 33` centres the drawn shape's bounding box (y 11 → 52.8) in the 64-unit viewBox. The concept was
"variant B". An open-ring alternative was rejected because it read as a power icon
([DD-06](DESIGN_DECISIONS.md#dd-06-logo-concept-heptagon-route-with-a-compass-needle)).

**Wordmark:** "IKIGAI ATLAS" set in Inter SemiBold (600) and kept as **editable `<text>`** in every master. The text is
26 px with `textLength="203"`, so the width stays stable even when a fallback font renders it. Never outline the text in
a master. If an outlined version is ever needed (print, or a raster that contains text), derive it as an export (to
verify whether this is needed).

## Variants

All files are in `design/svg/logo/`. Every file except the app icon and splash is also served by the web build at
`/brand/<file>`.

| File                                         | Size      | Use                                                                                         |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `ikigai-atlas-symbol.svg`                    | 64 × 64   | Default symbol on light surfaces                                                            |
| `ikigai-atlas-symbol-on-dark.svg`            | 64 × 64   | Symbol on navy and dark surfaces                                                            |
| `ikigai-atlas-symbol-monochrome.svg`         | 64 × 64   | Single colour via `currentColor`. Set the CSS `color`.                                      |
| `ikigai-atlas-symbol-dimensions.svg`         | 64 × 64   | Nodes in the seven dimension accents. **Marketing only, ≥ 48 px**, never in product chrome. |
| `ikigai-atlas-wordmark.svg`                  | 207 × 28  | Wordmark alone on light surfaces                                                            |
| `ikigai-atlas-wordmark-on-dark.svg`          | 207 × 28  | Wordmark alone on dark surfaces                                                             |
| `ikigai-atlas-lockup-horizontal.svg`         | 283 × 64  | Default lockup: headers, documents, e-mail                                                  |
| `ikigai-atlas-lockup-horizontal-on-dark.svg` | 283 × 64  | Horizontal lockup on navy                                                                   |
| `ikigai-atlas-lockup-stacked.svg`            | 220 × 102 | Centred compositions: splash-like layouts, about pages, social cards                        |
| `ikigai-atlas-lockup-stacked-on-dark.svg`    | 220 × 102 | Stacked lockup on navy                                                                      |
| `ikigai-atlas-monochrome.svg`                | 283 × 64  | Horizontal lockup in `currentColor` (embossing, single-ink print, theming)                  |
| `ikigai-atlas-monochrome-on-light.svg`       | 283 × 64  | Monochrome lockup fixed to midnight-900 `#14243A`                                           |
| `ikigai-atlas-monochrome-on-dark.svg`        | 283 × 64  | Monochrome lockup fixed to ivory-100 `#F5F0E6`                                              |
| `ikigai-atlas-app-icon-master.svg`           | 1024²     | iOS, Play, PWA and social icon source: full-bleed navy, symbol only, no text                |
| `ikigai-atlas-app-icon-foreground.svg`       | 1024²     | Android adaptive-icon foreground (transparent)                                              |
| `ikigai-atlas-splash.svg`                    | 2732²     | Native splash source: navy with the centred symbol                                          |
| `favicon.svg`                                | 64 × 64   | Browser favicon. Switches to on-dark colours with `prefers-color-scheme: dark`.             |

In the Angular app, use the `<atlas-logo>` component rather than an `<img>` of these files
([COMPONENT_CATALOG](COMPONENT_CATALOG.md#atlas-logo)). It inlines the symbol, renders the wordmark as live text and
follows the dark theme automatically.

## Clear space

Let **X = ¼ of the symbol's height**. For example, X is 8 px for a 32 px symbol and 16 px for the 64 px symbol in a
full-size lockup.

- Keep at least **X** of empty space on all sides of the symbol or lockup. No text, edges or other marks may enter it.
- The masters already include about 6/64 of padding around the drawn mark, and that padding counts towards X.
- In the horizontal lockup, the gap between symbol and wordmark is fixed by the master (text starts at x = 78). Do not
  change it.

## Minimum sizes

The sizes were checked by rendering the masters with sharp/librsvg at the listed sizes and inspecting them at 1× and at
zoom.

| Asset                                     | Minimum                                      | Finding                                                                                                                                      |
| ----------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Symbol, full colour                       | **24 px** in UI. 16 px for favicon/tab only. | At 16 px the seven nodes merge into a toothed ring, but the two-tone needle stays recognisable. 24 px reads clearly. 32 and 48 px are clean. |
| Symbol, monochrome                        | **24 px**                                    | At 16 px the outlined south needle closes up                                                                                                 |
| Symbol, dimension colours                 | **48 px**, marketing only                    | The pastel nodes are weak on white below 48 px                                                                                               |
| Wordmark                                  | **14 px high** (≈ 13 px type)                | Smaller sizes lose the letter shapes                                                                                                         |
| Horizontal lockup                         | **32 px high**. Absolute minimum 24 px.      | The wordmark is about 13 px at 32 px. At 20 px it becomes illegible.                                                                         |
| Stacked lockup                            | **56 px high**                               | At 40 px the wordmark is about 10 px. 56 px keeps it at about 14 px.                                                                         |
| `<atlas-logo>` (`size` input = symbol px) | 24                                           | The default is 32. The wordmark renders at 0.406 × size.                                                                                     |

## Colour usage

| Element                        | On light (ivory or white) | On dark (midnight-900 or 950) | Single colour          |
| ------------------------------ | ------------------------- | ----------------------------- | ---------------------- |
| Route, nodes, wordmark         | midnight-900 `#14243A`    | ivory-100 `#F5F0E6`           | `currentColor`         |
| Needle north                   | gold-600 `#B88D52`        | gold-500 `#D5AD70`            | `currentColor` (solid) |
| Needle south                   | midnight-700 `#304A65`    | ivory-200 `#EAE2D4`           | `currentColor` outline |
| App icon and splash background | n/a                       | midnight-900 `#14243A`        | n/a                    |

- Approved backgrounds are ivory-50, white, ivory-100, midnight-900 and midnight-950.
- On photography or busy backgrounds, use the monochrome variant on a solid panel.
- Gold is an accent and never the dominant colour of the mark. The full-colour mark always has exactly one gold element:
  the north needle.

## Typography pairing

| Role                                 | Typeface                                  | Notes                                                                                 |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Wordmark, UI, data                   | **Inter** (variable, weights 400/500/600) | Wordmark is 600. Use tabular numerals for metrics, dates and money.                   |
| Editorial hero moments, award titles | **DM Serif Display** 400                  | Use sparingly. Never for dense data, controls or small text (§3.1). Synthesis is off. |
| Code and IDs                         | System monospace stack                    |                                                                                       |

## Do and don't

**Do**

- Use the supplied masters or `<atlas-logo>`, scaled proportionally.
- Use the on-dark variant on navy, and the monochrome variant when only one ink is available.
- Keep the clear space and the minimum sizes.
- Keep the wordmark as **IKIGAI ATLAS** in capitals and set in Inter 600.

**Don't**

- Recolour the nodes, except in `symbol-dimensions` for marketing at ≥ 48 px, or make the route gold.
- Rotate the mark. North must point up.
- Swap the needle colours.
- Open the ring or remove nodes. There are always seven.
- Add effects: shadows, gradients, glows, outlines or 3D.
- Place the full-colour mark on mid-tone or patterned backgrounds.
- Stretch or condense the mark, or change the letter spacing beyond the master's `textLength`.
- Write the name differently, for example "Ikigai Atlas", "IKIGAIATLAS" or "Atlas" alone as the logo. "Atlas" is
  allowed as the PWA `short_name`.
- Put text inside the app icon.
- Use emoji or other icon sets next to the mark.

## App icon, splash and favicon rules

- **App icon master:** a 1024 × 1024 full-bleed, opaque navy square. The symbol is centred at about 570 px wide.
  - It contains no text.
  - It has no rounded corners, because the platforms apply their own masks.
  - It has no transparency, which iOS App Store requires.
- **Android adaptive icon:**
  - **Foreground:** `app-icon-foreground.svg` is a transparent 1024 px canvas (= 108 dp). The mark radius of about
    274 px stays inside the 66 dp safe circle (radius about 313 px).
  - **Background:** solid `#14243A`.
- **Splash:** a 2732² navy square with the symbol only, centred at about 25% of the width. Light and dark splash are
  currently identical.
- **Favicon:** `favicon.svg` is the vector icon and adapts to `prefers-color-scheme`. `favicon.ico` contains 16, 32 and
  48 px PNGs for legacy browsers. At 16 px the mark is a recognisable silhouette, not a detailed logo.
- **PWA and touch icons:** 180, 192 and 512 px rasters come from the app-icon master. See
  [ASSET_EXPORTS.md](ASSET_EXPORTS.md).

## Licensing

| Asset                                                   | Licence                   | Notes                                                                                 |
| ------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| IKIGAI ATLAS logo masters                               | Project-owned             | Original geometry, no third-party artwork                                             |
| Inter (`@fontsource-variable/inter` 5.3.0)              | SIL Open Font License 1.1 | Self-hosted. The licence permits bundling in apps.                                    |
| DM Serif Display (`@fontsource/dm-serif-display` 5.3.0) | SIL Open Font License 1.1 | Self-hosted, weight 400 only                                                          |
| Tabler Icons (`@tabler/icons(-angular)` 3.51.0)         | MIT, © Paweł Kuna         | Used for UI icons and the seven dimension SVGs. Attribution is a comment in each SVG. |

Masters that contain text name their font dependency in an SVG comment ("Inter SemiBold (600), SIL OFL 1.1"). Rendering
a master on a machine without Inter falls back to a system sans, and `textLength` keeps the width stable. The current
raster exports contain no text, so they do not depend on Inter.
