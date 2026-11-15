import { DOCUMENT, Injectable, Injector, afterNextRender, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, skip } from 'rxjs';

/**
 * Moves focus to the page `h1` after each in-app navigation (WCAG 2.4.3), so screen reader and keyboard users
 * start at the new content. The first load keeps the browser default (focus on the document).
 */
@Injectable({ providedIn: 'root' })
export class AtlasRouteFocus {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
      )
      .subscribe(() => afterNextRender(() => this.focusHeading(), { injector: this.injector }));
  }

  private focusHeading(): void {
    const heading = this.document.querySelector<HTMLElement>('main h1');
    if (!heading) {
      return;
    }
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
    }
    heading.focus({ preventScroll: true });
  }
}
