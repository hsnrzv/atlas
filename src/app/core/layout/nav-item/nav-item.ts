import { Component, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AtlasIcon } from '../../../shared/icons/atlas-icon';
import type { AtlasNavLink } from '../navigation';

/**
 * Sidebar and rail navigation link (Figma Atlas/V3/Navigation/Item 152:2587). The active item gets the
 * success-tint surface and `aria-current="page"`; in the rail the label becomes the accessible name and a
 * tooltip.
 */
@Component({
  selector: 'atlas-nav-item',
  imports: [AtlasIcon, MatTooltip, RouterLink, RouterLinkActive],
  template: `
    <a
      class="item"
      [routerLink]="link().path"
      routerLinkActive="is-active"
      ariaCurrentWhenActive="page"
      [attr.aria-label]="compact() ? link().label : null"
      [matTooltip]="compact() ? link().label : ''"
      matTooltipPosition="right"
    >
      <atlas-icon class="icon" [name]="link().icon" size="lg" />
      @if (!compact()) {
        <span class="label">{{ link().label }}</span>
      }
    </a>
  `,
  styleUrl: './nav-item.scss',
  host: { '[class.is-compact]': 'compact()' },
})
export class AtlasNavItem {
  readonly link = input.required<AtlasNavLink>();
  /** Rail mode: icon only, label as accessible name and tooltip. */
  readonly compact = input(false);
}
