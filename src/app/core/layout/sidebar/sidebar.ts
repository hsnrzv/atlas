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
  template: `
    <a class="brand" [routerLink]="home.path" aria-label="IKIGAI ATLAS, go to My Atlas">
      <atlas-logo
        [variant]="rail() ? 'symbol' : 'horizontal'"
        [size]="rail() ? 32 : 40"
        [decorative]="true"
      />
    </a>

    <nav class="nav" aria-label="Primary">
      @if (!rail()) {
        <p class="group-label" id="atlas-nav-primary-label">Your Atlas</p>
      }
      <ul
        class="list"
        [attr.aria-labelledby]="rail() ? null : 'atlas-nav-primary-label'"
        role="list"
      >
        @for (link of primary; track link.path) {
          <li><atlas-nav-item [link]="link" [compact]="rail()" /></li>
        }
      </ul>

      <ul class="list account" aria-label="Account" role="list">
        @for (link of account; track link.path) {
          <li><atlas-nav-item [link]="link" [compact]="rail()" /></li>
        }
      </ul>
    </nav>

    @if (!rail()) {
      <footer class="footer">
        <p class="footer-label">Private workspace</p>
        <p class="footer-text">Your life, mapped with purpose.</p>
      </footer>
    }
  `,
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
