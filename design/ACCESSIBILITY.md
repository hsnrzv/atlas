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
| Focus                         | 2px ring, 2px offset, `--color-focus-ring` per theme, `Highlight` in forced colours, Material strong focus indicators         | Implemented                                             |
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

- **Source:** `design/tokens/contrast-pairs.json` declares every foreground/background pair the UI uses. There are 123
  pairs, covering the Figma V3 light and dark themes, the Life Dimension and status colours, and the brand primitives.
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

**Result at the time of writing:** 123 pairs, **0 failing**. Nine pairs are `info` rows that document limitations.

### Generated table

The table between the markers is the verbatim output of `node scripts/design-tokens/check-contrast.mjs --markdown`.
Regenerate it whenever `colors.json` or `contrast-pairs.json` changes.

<!-- contrast-table:start — generated, do not edit by hand -->
<!-- prettier-ignore-start -->
| Use | Foreground | Background | Ratio | Required | Result |
| --- | --- | --- | ---: | ---: | --- |
| Light: primary text on page | `light text.primary` #1D2935 | `light surface.page` #F5F7FA | 13.77:1 | 4.5:1 (text) | Pass |
| Light: primary text on navigation | `light text.primary` #1D2935 | `light surface.navigation` #FFFFFF | 14.78:1 | 4.5:1 (text) | Pass |
| Light: primary text on card | `light text.primary` #1D2935 | `light surface.card` #FFFFFF | 14.78:1 | 4.5:1 (text) | Pass |
| Light: primary text on raised | `light text.primary` #1D2935 | `light surface.raised` #EAF0F4 | 12.86:1 | 4.5:1 (text) | Pass |
| Light: primary text on subtle | `light text.primary` #1D2935 | `light surface.subtle` #E8F1EE | 12.84:1 | 4.5:1 (text) | Pass |
| Light: primary text on hero | `light text.primary` #1D2935 | `light surface.hero` #FFFFFF | 14.78:1 | 4.5:1 (text) | Pass |
| Light: secondary and muted text on page | `light text.secondary` #586578 | `light surface.page` #F5F7FA | 5.52:1 | 4.5:1 (text) | Pass |
| Light: secondary and muted text on navigation | `light text.secondary` #586578 | `light surface.navigation` #FFFFFF | 5.92:1 | 4.5:1 (text) | Pass |
| Light: secondary and muted text on card | `light text.secondary` #586578 | `light surface.card` #FFFFFF | 5.92:1 | 4.5:1 (text) | Pass |
| Light: secondary and muted text on raised | `light text.secondary` #586578 | `light surface.raised` #EAF0F4 | 5.15:1 | 4.5:1 (text) | Pass |
| Light: secondary and muted text on subtle | `light text.secondary` #586578 | `light surface.subtle` #E8F1EE | 5.14:1 | 4.5:1 (text) | Pass |
| Light: primary text on achievement surface | `light text.primary` #1D2935 | `light surface.achievement` #F4EFE5 | 12.90:1 | 4.5:1 (text) | Pass |
| Light: achievement text on achievement surface | `light text.achievement` #765728 | `light surface.achievement` #F4EFE5 | 5.79:1 | 4.5:1 (text) | Pass |
| Light: achievement text on card | `light text.achievement` #765728 | `light surface.card` #FFFFFF | 6.64:1 | 4.5:1 (text) | Pass |
| Light: active navigation label | `light text.primary` #1D2935 | `light nav.active` #E8F1EE | 12.84:1 | 4.5:1 (text) | Pass |
| Light: button label on primary | `light action.on-primary` #FFFFFF | `light action.primary` #2D6A61 | 6.28:1 | 4.5:1 (text) | Pass |
| Light: button label on primary-hover | `light action.on-primary` #FFFFFF | `light action.primary-hover` #205D55 | 7.61:1 | 4.5:1 (text) | Pass |
| Light: button label on primary-pressed | `light action.on-primary` #FFFFFF | `light action.primary-pressed` #123F3C | 11.65:1 | 4.5:1 (text) | Pass |
| Light: disabled button label (exempt, SC 1.4.3) | `light action.on-disabled` #586578 | `light action.disabled` #EAF0F4 | 5.15:1 | info | Documented limitation |
| Light: label on destructive action | `light action.on-destructive` #FFFFFF | `light action.destructive` #924D53 | 6.16:1 | 4.5:1 (text) | Pass |
| Light: filled button boundary on card (label identifies the control, SC 1.4.11) | `light action.primary` #2D6A61 | `light surface.card` #FFFFFF | 6.28:1 | info | Documented limitation |
| Light: primary button outline on card (Figma border/action) | `light border.action` #2D6A61 | `light surface.card` #FFFFFF | 6.28:1 | 3:1 (non-text) | Pass |
| Light: inline link underline on page (link text is text/primary) | `light border.action` #2D6A61 | `light surface.page` #F5F7FA | 5.85:1 | 3:1 (non-text) | Pass |
| Light: inline link underline on card (link text is text/primary) | `light border.action` #2D6A61 | `light surface.card` #FFFFFF | 6.28:1 | 3:1 (non-text) | Pass |
| Light: form control and secondary button boundary on card | `light border.control` #798B88 | `light surface.card` #FFFFFF | 3.58:1 | 3:1 (non-text) | Pass |
| Light: form control boundary on page | `light border.control` #798B88 | `light surface.page` #F5F7FA | 3.34:1 | 3:1 (non-text) | Pass |
| Light: form control boundary on raised | `light border.control` #798B88 | `light surface.raised` #EAF0F4 | 3.12:1 | 3:1 (non-text) | Pass |
| Light: focus ring on page | `light focus.ring` #65518C | `light surface.page` #F5F7FA | 6.29:1 | 3:1 (non-text) | Pass |
| Light: focus ring on card | `light focus.ring` #65518C | `light surface.card` #FFFFFF | 6.75:1 | 3:1 (non-text) | Pass |
| Light: focus ring on raised | `light focus.ring` #65518C | `light surface.raised` #EAF0F4 | 5.88:1 | 3:1 (non-text) | Pass |
| Light: focus ring on navigation | `light focus.ring` #65518C | `light surface.navigation` #FFFFFF | 6.75:1 | 3:1 (non-text) | Pass |
| Light: progress fill on track | `light progress.fill` #2D6A61 | `light progress.track` #DCE4E9 | 4.88:1 | 3:1 (non-text) | Pass |
| Light: progress fill on card | `light progress.fill` #2D6A61 | `light surface.card` #FFFFFF | 6.28:1 | 3:1 (non-text) | Pass |
| Light: success badge label on its tint | `light status.success` #2D6A61 | `light status.success.tint` #E8F1EE | 5.45:1 | 4.5:1 (text) | Pass |
| Light: success icon on card | `light status.success` #2D6A61 | `light surface.card` #FFFFFF | 6.28:1 | 3:1 (non-text) | Pass |
| Light: in-progress badge label on its tint | `light status.in-progress` #426D9B | `light status.in-progress.tint` #EAF1F8 | 4.74:1 | 4.5:1 (text) | Pass |
| Light: in-progress icon on card | `light status.in-progress` #426D9B | `light surface.card` #FFFFFF | 5.40:1 | 3:1 (non-text) | Pass |
| Light: upcoming badge label on its tint | `light status.upcoming` #765728 | `light status.upcoming.tint` #F4EFE5 | 5.79:1 | 4.5:1 (text) | Pass |
| Light: upcoming icon on card | `light status.upcoming` #765728 | `light surface.card` #FFFFFF | 6.64:1 | 3:1 (non-text) | Pass |
| Light: at-risk badge label on its tint | `light status.at-risk` #8F5D36 | `light status.at-risk.tint` #F4EFE5 | 4.84:1 | 4.5:1 (text) | Pass |
| Light: at-risk icon on card | `light status.at-risk` #8F5D36 | `light surface.card` #FFFFFF | 5.55:1 | 3:1 (non-text) | Pass |
| Light: blocked badge label on its tint | `light status.blocked` #924D53 | `light status.blocked.tint` #F8EEEA | 5.40:1 | 4.5:1 (text) | Pass |
| Light: blocked icon on card | `light status.blocked` #924D53 | `light surface.card` #FFFFFF | 6.16:1 | 3:1 (non-text) | Pass |
| Light: not-started badge label on its tint | `light status.not-started` #586578 | `light status.not-started.tint` #EAF0F4 | 5.15:1 | 4.5:1 (text) | Pass |
| Light: not-started icon on card | `light status.not-started` #586578 | `light surface.card` #FFFFFF | 5.92:1 | 3:1 (non-text) | Pass |
| Light: career chip label on its tint | `light dimension.career` #426D9B | `light dimension.career.tint` #EAF1F8 | 4.74:1 | 4.5:1 (text) | Pass |
| Light: career icon on card | `light dimension.career` #426D9B | `light surface.card` #FFFFFF | 5.40:1 | 3:1 (non-text) | Pass |
| Light: finance chip label on its tint | `light dimension.finance` #805B2F | `light dimension.finance.tint` #F6EFE3 | 5.32:1 | 4.5:1 (text) | Pass |
| Light: finance icon on card | `light dimension.finance` #805B2F | `light surface.card` #FFFFFF | 6.08:1 | 3:1 (non-text) | Pass |
| Light: health chip label on its tint | `light dimension.health` #52765B | `light dimension.health.tint` #EDF3EE | 4.55:1 | 4.5:1 (text) | Pass |
| Light: health icon on card | `light dimension.health` #52765B | `light surface.card` #FFFFFF | 5.12:1 | 3:1 (non-text) | Pass |
| Light: love chip label on its tint | `light dimension.love` #965B4A | `light dimension.love.tint` #F8EEEA | 4.73:1 | 4.5:1 (text) | Pass |
| Light: love icon on card | `light dimension.love` #965B4A | `light surface.card` #FFFFFF | 5.40:1 | 3:1 (non-text) | Pass |
| Light: passion chip label on its tint | `light dimension.passion` #6F5C98 | `light dimension.passion.tint` #F1EEF7 | 5.00:1 | 4.5:1 (text) | Pass |
| Light: passion icon on card | `light dimension.passion` #6F5C98 | `light surface.card` #FFFFFF | 5.74:1 | 3:1 (non-text) | Pass |
| Light: friendship chip label on its tint | `light dimension.friendship` #3F7776 | `light dimension.friendship.tint` #EAF3F2 | 4.52:1 | 4.5:1 (text) | Pass |
| Light: friendship icon on card | `light dimension.friendship` #3F7776 | `light surface.card` #FFFFFF | 5.11:1 | 3:1 (non-text) | Pass |
| Light: family chip label on its tint | `light dimension.family` #80683E | `light dimension.family.tint` #F5F0E5 | 4.66:1 | 4.5:1 (text) | Pass |
| Light: family icon on card | `light dimension.family` #80683E | `light surface.card` #FFFFFF | 5.29:1 | 3:1 (non-text) | Pass |
| Dark: primary text on page | `dark text.primary` #F5F7FC | `dark surface.page` #0B1020 | 17.66:1 | 4.5:1 (text) | Pass |
| Dark: primary text on navigation | `dark text.primary` #F5F7FC | `dark surface.navigation` #151B35 | 15.80:1 | 4.5:1 (text) | Pass |
| Dark: primary text on card | `dark text.primary` #F5F7FC | `dark surface.card` #202A46 | 13.23:1 | 4.5:1 (text) | Pass |
| Dark: primary text on raised | `dark text.primary` #F5F7FC | `dark surface.raised` #273452 | 11.53:1 | 4.5:1 (text) | Pass |
| Dark: primary text on subtle | `dark text.primary` #F5F7FC | `dark surface.subtle` #151B35 | 15.80:1 | 4.5:1 (text) | Pass |
| Dark: primary text on hero | `dark text.primary` #F5F7FC | `dark surface.hero` #151B35 | 15.80:1 | 4.5:1 (text) | Pass |
| Dark: secondary and muted text on page | `dark text.secondary` #A8B4CC | `dark surface.page` #0B1020 | 9.07:1 | 4.5:1 (text) | Pass |
| Dark: secondary and muted text on navigation | `dark text.secondary` #A8B4CC | `dark surface.navigation` #151B35 | 8.12:1 | 4.5:1 (text) | Pass |
| Dark: secondary and muted text on card | `dark text.secondary` #A8B4CC | `dark surface.card` #202A46 | 6.80:1 | 4.5:1 (text) | Pass |
| Dark: secondary and muted text on raised | `dark text.secondary` #A8B4CC | `dark surface.raised` #273452 | 5.92:1 | 4.5:1 (text) | Pass |
| Dark: secondary and muted text on subtle | `dark text.secondary` #A8B4CC | `dark surface.subtle` #151B35 | 8.12:1 | 4.5:1 (text) | Pass |
| Dark: primary text on achievement surface | `dark text.primary` #F5F7FC | `dark surface.achievement` #2E2B27 | 13.14:1 | 4.5:1 (text) | Pass |
| Dark: achievement text on achievement surface | `dark text.achievement` #D4B477 | `dark surface.achievement` #2E2B27 | 7.11:1 | 4.5:1 (text) | Pass |
| Dark: achievement text on card | `dark text.achievement` #D4B477 | `dark surface.card` #202A46 | 7.15:1 | 4.5:1 (text) | Pass |
| Dark: active navigation label | `dark text.primary` #F5F7FC | `dark nav.active` #1B302C | 13.01:1 | 4.5:1 (text) | Pass |
| Dark: button label on primary | `dark action.on-primary` #F5F7FC | `dark action.primary` #205D55 | 7.10:1 | 4.5:1 (text) | Pass |
| Dark: button label on primary-hover | `dark action.on-primary` #F5F7FC | `dark action.primary-hover` #2D7266 | 5.28:1 | 4.5:1 (text) | Pass |
| Dark: button label on primary-pressed | `dark action.on-primary` #F5F7FC | `dark action.primary-pressed` #123F3C | 10.87:1 | 4.5:1 (text) | Pass |
| Dark: disabled button label (exempt, SC 1.4.3) | `dark action.on-disabled` #A8B4CC | `dark action.disabled` #273452 | 5.92:1 | info | Documented limitation |
| Dark: label on destructive action | `dark action.on-destructive` #0B1020 | `dark action.destructive` #DBA6A6 | 9.03:1 | 4.5:1 (text) | Pass |
| Dark: filled button boundary on card (label identifies the control, SC 1.4.11) | `dark action.primary` #205D55 | `dark surface.card` #202A46 | 1.86:1 | info | Documented limitation |
| Dark: primary button outline on card (Figma border/action) | `dark border.action` #4B9387 | `dark surface.card` #202A46 | 3.93:1 | 3:1 (non-text) | Pass |
| Dark: inline link underline on page (link text is text/primary) | `dark border.action` #4B9387 | `dark surface.page` #0B1020 | 5.25:1 | 3:1 (non-text) | Pass |
| Dark: inline link underline on card (link text is text/primary) | `dark border.action` #4B9387 | `dark surface.card` #202A46 | 3.93:1 | 3:1 (non-text) | Pass |
| Dark: form control and secondary button boundary on card | `dark border.control` #8290AA | `dark surface.card` #202A46 | 4.40:1 | 3:1 (non-text) | Pass |
| Dark: form control boundary on page | `dark border.control` #8290AA | `dark surface.page` #0B1020 | 5.88:1 | 3:1 (non-text) | Pass |
| Dark: form control boundary on raised | `dark border.control` #8290AA | `dark surface.raised` #273452 | 3.84:1 | 3:1 (non-text) | Pass |
| Dark: focus ring on page | `dark focus.ring` #B8A5D0 | `dark surface.page` #0B1020 | 8.41:1 | 3:1 (non-text) | Pass |
| Dark: focus ring on card | `dark focus.ring` #B8A5D0 | `dark surface.card` #202A46 | 6.30:1 | 3:1 (non-text) | Pass |
| Dark: focus ring on raised | `dark focus.ring` #B8A5D0 | `dark surface.raised` #273452 | 5.49:1 | 3:1 (non-text) | Pass |
| Dark: focus ring on navigation | `dark focus.ring` #B8A5D0 | `dark surface.navigation` #151B35 | 7.52:1 | 3:1 (non-text) | Pass |
| Dark: progress fill on track | `dark progress.fill` #4B9387 | `dark progress.track` #273452 | 3.43:1 | 3:1 (non-text) | Pass |
| Dark: progress fill on card | `dark progress.fill` #4B9387 | `dark surface.card` #202A46 | 3.93:1 | 3:1 (non-text) | Pass |
| Dark: success badge label on its tint | `dark status.success` #9BBBA7 | `dark status.success.tint` #1B302C | 6.68:1 | 4.5:1 (text) | Pass |
| Dark: success icon on card | `dark status.success` #9BBBA7 | `dark surface.card` #202A46 | 6.79:1 | 3:1 (non-text) | Pass |
| Dark: in-progress badge label on its tint | `dark status.in-progress` #A6C3DF | `dark status.in-progress.tint` #1B2D44 | 7.63:1 | 4.5:1 (text) | Pass |
| Dark: in-progress icon on card | `dark status.in-progress` #A6C3DF | `dark surface.card` #202A46 | 7.76:1 | 3:1 (non-text) | Pass |
| Dark: upcoming badge label on its tint | `dark status.upcoming` #D4B477 | `dark status.upcoming.tint` #2E2B27 | 7.11:1 | 4.5:1 (text) | Pass |
| Dark: upcoming icon on card | `dark status.upcoming` #D4B477 | `dark surface.card` #202A46 | 7.15:1 | 3:1 (non-text) | Pass |
| Dark: at-risk badge label on its tint | `dark status.at-risk` #D6AE8F | `dark status.at-risk.tint` #2E2B27 | 6.91:1 | 4.5:1 (text) | Pass |
| Dark: at-risk icon on card | `dark status.at-risk` #D6AE8F | `dark surface.card` #202A46 | 6.96:1 | 3:1 (non-text) | Pass |
| Dark: blocked badge label on its tint | `dark status.blocked` #DBA6A6 | `dark status.blocked.tint` #35242E | 6.94:1 | 4.5:1 (text) | Pass |
| Dark: blocked icon on card | `dark status.blocked` #DBA6A6 | `dark surface.card` #202A46 | 6.76:1 | 3:1 (non-text) | Pass |
| Dark: not-started badge label on its tint | `dark status.not-started` #A8B4CC | `dark status.not-started.tint` #273452 | 5.92:1 | 4.5:1 (text) | Pass |
| Dark: not-started icon on card | `dark status.not-started` #A8B4CC | `dark surface.card` #202A46 | 6.80:1 | 3:1 (non-text) | Pass |
| Dark: career chip label on its tint | `dark dimension.career` #A6C3DF | `dark dimension.career.tint` #1B2D44 | 7.63:1 | 4.5:1 (text) | Pass |
| Dark: career icon on card | `dark dimension.career` #A6C3DF | `dark surface.card` #202A46 | 7.76:1 | 3:1 (non-text) | Pass |
| Dark: finance chip label on its tint | `dark dimension.finance` #D4B477 | `dark dimension.finance.tint` #302A24 | 7.15:1 | 4.5:1 (text) | Pass |
| Dark: finance icon on card | `dark dimension.finance` #D4B477 | `dark surface.card` #202A46 | 7.15:1 | 3:1 (non-text) | Pass |
| Dark: health chip label on its tint | `dark dimension.health` #9BBBA7 | `dark dimension.health.tint` #1B302C | 6.68:1 | 4.5:1 (text) | Pass |
| Dark: health icon on card | `dark dimension.health` #9BBBA7 | `dark surface.card` #202A46 | 6.79:1 | 3:1 (non-text) | Pass |
| Dark: love chip label on its tint | `dark dimension.love` #D5A498 | `dark dimension.love.tint` #35242E | 6.65:1 | 4.5:1 (text) | Pass |
| Dark: love icon on card | `dark dimension.love` #D5A498 | `dark surface.card` #202A46 | 6.48:1 | 3:1 (non-text) | Pass |
| Dark: passion chip label on its tint | `dark dimension.passion` #B8A5D0 | `dark dimension.passion.tint` #2C263D | 6.43:1 | 4.5:1 (text) | Pass |
| Dark: passion icon on card | `dark dimension.passion` #B8A5D0 | `dark surface.card` #202A46 | 6.30:1 | 3:1 (non-text) | Pass |
| Dark: friendship chip label on its tint | `dark dimension.friendship` #9AC2BC | `dark dimension.friendship.tint` #193337 | 6.89:1 | 4.5:1 (text) | Pass |
| Dark: friendship icon on card | `dark dimension.friendship` #9AC2BC | `dark surface.card` #202A46 | 7.30:1 | 3:1 (non-text) | Pass |
| Dark: family chip label on its tint | `dark dimension.family` #C6B184 | `dark dimension.family.tint` #302C25 | 6.63:1 | 4.5:1 (text) | Pass |
| Dark: family icon on card | `dark dimension.family` #C6B184 | `dark surface.card` #202A46 | 6.77:1 | 3:1 (non-text) | Pass |
| Primitive: light-gold on white is decorative or large text only | `gold.light` #A17A3F | `light.card` #FFFFFF | 3.91:1 | info | Documented limitation |
| Logo circle blue on white (decorative, paired with wordmark) | `brand.venn.blue` #5685B5 | `light.card` #FFFFFF | 3.88:1 | info | Documented limitation |
| Logo circle teal on white (decorative, paired with wordmark) | `brand.venn.teal` #348F84 | `light.card` #FFFFFF | 3.88:1 | info | Documented limitation |
| Logo circle violet on white (decorative, paired with wordmark) | `brand.venn.violet` #8A73BB | `light.card` #FFFFFF | 4.00:1 | info | Documented limitation |
| Logo circle rose on white (decorative, paired with wordmark) | `brand.venn.rose` #B17D9E | `light.card` #FFFFFF | 3.34:1 | info | Documented limitation |
<!-- prettier-ignore-end -->
<!-- contrast-table:end -->

### Documented limitations and mitigations

| Limitation (`info` rows)                        | Rule                                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disabled button label on the disabled surface   | Disabled controls are exempt from SC 1.4.3. The pair is reported (5.15:1 light, 5.92:1 dark) so a regression is visible.                                                        |
| Dark filled button boundary on a card is 1.86:1 | SC 1.4.11 does not require a visible boundary when the label identifies the control. The label (`--color-action-on-primary`) passes 4.5:1 on every action state in both themes. |
| `color.gold.light` `#A17A3F` is 3.91:1 on white | Decorative or large text only. Small achievement text uses `--color-text-achievement` (`#765728` light, 5.79:1 on the achievement surface).                                     |
| Logo circles are 3.34–4.00:1 on white           | The Venn colours are decorative, belong to the logo only and are always paired with the wordmark or an accessible name. Never use them to convey meaning.                       |

### Colour rules (summary)

1. Body text uses `--color-text-primary` or `--color-text-secondary`. Metadata uses `--color-text-muted`. Disabled
   controls use `--color-action-on-disabled` on `--color-action-disabled`, which is exempt under WCAG 1.4.3.
2. **Status = icon + label.** Get both from `ATLAS_STATUSES`. Labels use the status foreground on its `-tint`
   background, which passes 4.5:1 in both themes. In-progress is the same colour as the Career foreground in both
   themes (`#426D9B` light, `#A6C3DF` dark), so never rely on hue to tell them apart
   ([DD-10](DESIGN_DECISIONS.md#dd-10-in-progress-status-equals-career-strong)).
3. **Life Dimension = icon + name**, using the colours from `LIFE_DIMENSIONS`.
4. Links use `--color-text-primary` text and are always underlined with `--color-border-action`. Teal link text would
   be only 3.93:1 on a dark card.
5. Selected states combine tint, border, icon and text (design-instructions §15). They never rely on colour alone.
6. Chart series use the dimension foregrounds (`--color-dimension-<key>`) with direct labels or a legend that carries
   text. Gridlines are minimal, and colour-vision-ambiguous pairs (for example Health and Friendship) are never the
   only distinction.
7. Use the semantic tokens only. Every surface, text, border, status and dimension token has its own light and dark
   value (`[data-theme='dark']`), so the same token is correct in both themes. There are no inverse surfaces or
   `status-on-dark` colours any more.

## Focus

- **Global ring** (`src/styles/base/_accessibility.scss`): `:focus-visible` draws a `--size-focus-ring-width` (2px)
  solid outline at `--size-focus-ring-offset` (2px) in `--color-focus-ring`. That is violet `#65518C` in light (6.29:1
  on the page) and violet accent `#B8A5D0` in dark (8.41:1 on the page). The same ring is used on every surface,
  including the sidebar, hero and bottom navigation; there is no inverse variant.
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
  navigation. Figma V3 and `--layout-bottom-nav-height` use 80 px.

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
- an **icon** (Tabler outline, stroke 2): `check`, `loader-2`, `calendar-week`, `alert-circle`, `lock`, `flag`;
- a theme-aware **colour token** and a `-tint` background token.

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
