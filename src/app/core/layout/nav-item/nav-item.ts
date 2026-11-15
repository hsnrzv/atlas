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
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.scss',
  host: { '[class.is-compact]': 'compact()' },
})
export class AtlasNavItem {
  readonly link = input.required<AtlasNavLink>();
  /** Rail mode: icon only, label as accessible name and tooltip. */
  readonly compact = input(false);
}
