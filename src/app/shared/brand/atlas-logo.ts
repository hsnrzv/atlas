import { Component, input } from '@angular/core';

export type AtlasLogoVariant = 'symbol' | 'horizontal';

/** Cardinal Ikigai Venn circles (design/svg/logo/ikigai-atlas-symbol.svg): N, W, E, S on a 64 grid. */
const CIRCLES = [
  { key: 'top', cx: 32, cy: 20.8 },
  { key: 'left', cx: 20.8, cy: 32 },
  { key: 'right', cx: 43.2, cy: 32 },
  { key: 'bottom', cx: 32, cy: 43.2 },
] as const;

/**
 * In-app IKIGAI ATLAS logo. The symbol is inlined so it can follow the theme; the wordmark is live
 * text set in the app's Manrope font. Exported/brand files live in `design/svg/logo/` (served at /brand).
 */
@Component({
  selector: 'atlas-logo',
  templateUrl: './atlas-logo.html',
  styleUrl: './atlas-logo.scss',
  host: {
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : "IKIGAI ATLAS"',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[style.--atlas-logo-size.px]': 'size()',
  },
})
export class AtlasLogo {
  readonly variant = input<AtlasLogoVariant>('horizontal');
  /** Symbol height in px; the wordmark scales with it. */
  readonly size = input(32);
  /** Set when an adjacent element already names the product. */
  readonly decorative = input(false);

  protected readonly circles = CIRCLES;
}
