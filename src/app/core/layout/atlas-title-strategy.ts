import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_NAME = 'IKIGAI ATLAS';

/**
 * Sets the document title to "<Page> · IKIGAI ATLAS" from the route `title` and exposes the page name to the
 * top bar, so routes declare their title once.
 */
@Injectable({ providedIn: 'root' })
export class AtlasTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  /** Title of the active page, without the app name. */
  readonly pageTitle = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? '';
    this.pageTitle.set(pageTitle);
    this.title.setTitle(pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME);
  }
}
