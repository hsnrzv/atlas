import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AtlasLogo } from '../../../shared/brand/atlas-logo';
import { ACCOUNT_NAV, MY_ATLAS, PRIMARY_NAV } from '../navigation';
import { AtlasNavItem } from '../nav-item/nav-item';

/**
 * Persistent navigation from 768 px (Figma Atlas/V3/Sidebar 152:5175): full sidebar at ≥ 1024 px, icon rail
 * (Atlas/V3/NavigationRail 152:5299) between 768 and 1023 px.
 */
@Component({
  selector: 'atlas-sidebar',
  imports: [AtlasLogo, AtlasNavItem, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: { '[class.is-rail]': 'rail()' },
})
export class AtlasSidebar {
  /** Icon-only rail (768–1023 px). */
  readonly rail = input(false);

  protected readonly home = MY_ATLAS;
  protected readonly primary = PRIMARY_NAV;
  protected readonly account = ACCOUNT_NAV;
}
