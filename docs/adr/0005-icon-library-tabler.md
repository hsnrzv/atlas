# ADR-0005: Icon library — Tabler Icons behind a semantic `<atlas-icon>` registry

- Status: Accepted; amended by [ADR-0010](0010-figma-visual-source-of-truth.md) (stroke 2, Figma V3 glyphs)
- Date: 2026-11-12
- Deciders: @hsnrzv (owner)

## Context

The two specifications disagree. `project-instruction.md` §9.1 proposes Tabler Icons (MIT) with a typed wrapper and
registry. `design-instructions.md` §5.1 proposes Lucide with a suggested mapping. Both ask for one consistent outline
family, a 1.75–2 stroke, 16/18/20/24 px sizes, accessible names for icon-only buttons, and a seven-icon Life Dimension
set on a 24 × 24 grid using `currentColor`. On 2026-11-12 the owner chose **Tabler**.

Verified on 2026-11-12: `@tabler/icons` and `@tabler/icons-angular` 3.51.0, MIT, © Paweł Kuna. The Angular package
exports one tree-shakable icon object per glyph (for example `IconCompass`), with kebab-case `name` and
`type: 'outline'`.

## Decision

- Use **`@tabler/icons-angular` 3.x, outline family only**, never mixed with filled icons or another set.
- Features never import Tabler directly. They use `<atlas-icon name="…">`
  (`src/app/shared/icons/atlas-icon.ts`) with a **semantic name** from `ATLAS_ICONS`
  (`src/app/shared/icons/atlas-icons.ts`). The registry maps meaning to glyph, so a glyph changes in one place.
  `AtlasIconName` is the union of registry keys, so unknown names fail type-checking.
- Defaults: stroke **1.75**; sizes `xs` 16, `sm` 18, `md` 20 (default), `lg` 24 px (24 for primary navigation, 20 for
  buttons and rows, 16 inline). Icons are **decorative by default** (`aria-hidden="true"`). Passing `label` renders
  `role="img"` and `aria-label`. Icon-only buttons put their accessible name on the button.
- Mapping from the design suggestion (Lucide → Tabler): My Atlas `compass`; Destinations `flag`; Waypoints `map-pin`;
  Steps `list-check`; Connections `affiliate` (Lucide `network`); Journey Overview `route`; Milestone Awards `award`;
  Life Dimensions `circle-dot`; Career `briefcase`; Finance `wallet`; Health `heartbeat`; Love `heart`; Passion
  `sparkles`; Friendship `users`; Family `home`; plus action and status icons (`plus`, `pencil`, `trash`,
  `notebook`, `calendar-event`, `adjustments-horizontal`, `search`, `settings`, `lock`, `circle-check`,
  `alert-triangle`, …).
- **Life Dimension icons** use the same registry. The glyph names live in
  `design/tokens/design-tokens.json → lifeDimensions.icons`, and a unit test asserts that the runtime registry uses the
  same glyphs. (Superseded 2026-11-14: the `design/svg/dimensions` copies were removed; see the amendment below.)

## Amendment 2026-11-14 (Figma V3, roadmap T-3)

- **Stroke 2** (`ATLAS_ICON_STROKE`), matching the Figma `Atlas/V3/Icon` component set (152:2139). Sizes are unchanged.
- **Glyph provenance.** The Figma glyph descriptions credit **Lucide** (ISC). This ADR, `project-instruction.md` §9.1
  and owner decision R-4 keep **Tabler**, so each Figma glyph was matched to its closest Tabler outline after a visual
  side-by-side comparison. Switching to Lucide would need a new owner decision and a superseding ADR.
- **Registry changes:** Connections `affiliate` → `sitemap`; Life Dimensions `circle-dot` → `orbit`; calendar
  `calendar-event` → `calendar-week` (Figma shows a dot grid); more `dots-vertical` → `dots`. New semantic names:
  `next` (`arrow-right`), `check` (`check`), `alert` (`alert-circle`), `loading` (`loader-2`), `collapse`
  (`chevron-down`), `view-grid` (`layout-grid`), `view-list` (`list`).
- **Status glyphs** follow Figma Foundations (214:1794): success `check`, in progress `loader-2`, upcoming
  `calendar-week`, at risk `alert-circle`, blocked `lock`, not started `flag`. Status is never shown by colour alone;
  each chip pairs its glyph with a text label.
- **No duplicate SVG copies** (owner review, Phase 2). `design/svg/dimensions/*.svg`, `scripts/assets/sync-dimension-icons.mjs`,
  `icons:sync`/`icons:check` and the direct `@tabler/icons` devDependency were removed. Life Dimension icons render
  through `<atlas-icon>` like every other icon, so Tabler is the single source.
- **No icon webfont.** `<i class="ti ti-…">` needs `@tabler/icons-webfont`, which ships every glyph as one font file
  (no tree-shaking), adds a font request and gives no type-checked names. The tree-shakable Angular components stay.

## Consequences

- A large, consistent MIT set (over 6,000 icons per §9.1) with per-icon tree-shaking and no global icon font.
- The design document's Lucide names do not apply directly. The mapping above, and `design/` docs that cite Tabler
  names, are the reference.
- Adding an icon is a one-line registry change plus a review that it fits the outline family.
- If Tabler ever changes a glyph, it shows in the visual review of the Dependabot update (`/_design`).

## Alternatives considered

- **Lucide** (`design-instructions.md` §5.1): a similar quality outline set (ISC). Rejected by owner preference, which
  also matches `project-instruction.md` §9.1.
- **Material Symbols** (bundled with the Material ecosystem): a different visual language (filled and rounded variants,
  icon font or variable font). It is less aligned with the calm line style and adds a font request.
- **Custom SVG set:** maximum coherence but high cost. Kept as a fallback only for Life Dimensions if Tabler glyphs stop
  fitting.

## References

- `project-instruction.md` §9.1; `design-instructions.md` §5.1, §11
- Tabler Icons repository and MIT license: <https://github.com/tabler/tabler-icons> (accessed 2026-11-12)
- `@tabler/icons-angular` on npm: <https://www.npmjs.com/package/@tabler/icons-angular> (accessed 2026-11-12)
- ADR-0006 (vocabulary), ADR-0007 (tokens)
