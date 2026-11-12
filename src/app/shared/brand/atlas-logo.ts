import { Component, input } from '@angular/core';

export type AtlasLogoVariant = 'symbol' | 'horizontal';
export type AtlasLogoTone = 'default' | 'inverse';

/** Waypoint centres of the logo heptagon (design/svg/logo/ikigai-atlas-symbol.svg). */
const NODES = [
  [32, 11],
  [49.2, 19.28],
  [53.45, 37.9],
  [41.55, 52.82],
  [22.45, 52.82],
  [10.55, 37.9],
  [14.8, 19.28],
] as const;

/**
 * In-app IKIGAI ATLAS logo. The symbol is inlined so it can follow the theme; the wordmark is live
 * text set in the app's Inter font. Exported/brand files live in `design/svg/logo/` (served at /brand).
 */
@Component({
  selector: 'atlas-logo',
  template: `
    <svg class="symbol" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <polygon class="route" [attr.points]="routePoints" />
      @for (node of nodes; track $index) {
        <circle class="node" [attr.cx]="node[0]" [attr.cy]="node[1]" r="4.5" />
      }
      <path class="north" d="M32 18 38 33H26Z" />
      <path class="south" d="M26 33H38L32 46Z" />
    </svg>
    @if (variant() === 'horizontal') {
      <span class="wordmark" aria-hidden="true">IKIGAI ATLAS</span>
    }
  `,
  styleUrl: './atlas-logo.scss',
  host: {
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : "IKIGAI ATLAS"',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.data-tone]': 'tone()',
    '[style.--atlas-logo-size.px]': 'size()',
  },
})
export class AtlasLogo {
  readonly variant = input<AtlasLogoVariant>('horizontal');
  /** `inverse` for navy surfaces (sidebar, splash). The dark theme switches to it automatically. */
  readonly tone = input<AtlasLogoTone>('default');
  /** Symbol height in px; the wordmark scales with it. */
  readonly size = input(32);
  /** Set when an adjacent element already names the product. */
  readonly decorative = input(false);

  protected readonly nodes = NODES;
  protected readonly routePoints = NODES.map(([x, y]) => `${x},${y}`).join(' ');
}
