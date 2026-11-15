import { afterNextRender, effect, ElementRef, inject, Injector } from '@angular/core';

/**
 * Each page state renders its own `h1`. When route focus sits on the old heading, hand it to the new one so
 * screen-reader users do not lose their place (WCAG 2.4.3). Call from a component constructor.
 */
export function keepHeadingFocus(state: () => unknown): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const injector = inject(Injector);
  effect(() => {
    state();
    const heading = host.querySelector('h1');
    if (heading && heading.ownerDocument.activeElement === heading) {
      afterNextRender(
        () => {
          const next = host.querySelector<HTMLElement>('h1');
          if (next && next.ownerDocument.activeElement !== next) {
            next.setAttribute('tabindex', '-1');
            next.focus({ preventScroll: true });
          }
        },
        { injector },
      );
    }
  });
}
