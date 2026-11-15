import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AtlasIcon } from '../../../shared/icons/atlas-icon';
import { AtlasNavLink, BOTTOM_NAV, MORE, MORE_PATHS } from '../navigation';

const pathOf = (url: string) => url.split(/[?#]/, 1)[0];
const within = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

/**
 * Mobile navigation below 768 px (Figma Atlas/V3/BottomNavigation 152:5351). "More" stays highlighted for
 * every area reached through the More page; there it is `aria-current="true"` (current section), and
 * `aria-current="page"` only on the More page itself.
 */
@Component({
  selector: 'atlas-bottom-nav',
  imports: [AtlasIcon, RouterLink],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class AtlasBottomNav {
  private readonly router = inject(Router);

  protected readonly links = BOTTOM_NAV;
  protected readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => pathOf(this.router.url)),
    ),
    { initialValue: pathOf(this.router.url) },
  );
  private readonly inMore = computed(() => MORE_PATHS.some((base) => within(this.path(), base)));

  protected isActive(link: AtlasNavLink): boolean {
    return link === MORE ? this.inMore() : within(this.path(), link.path);
  }

  protected ariaCurrent(link: AtlasNavLink): 'page' | 'true' | null {
    if (within(this.path(), link.path)) {
      return 'page';
    }
    return this.isActive(link) ? 'true' : null;
  }
}
