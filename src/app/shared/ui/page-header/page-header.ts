import { Component, input } from '@angular/core';

/**
 * Page title block (Figma Atlas/V3/PageHeader 152:6139). Renders the page `h1`; the shell moves focus to it after
 * navigation. Project a primary action with a `pageHeaderAction` attribute; it sits on the right from 768 px and
 * full width below. Project `<atlas-breadcrumbs>` to show the trail above the title. `level` 2 is only for
 * previews and nested panels that must not add a second `h1`; the title keeps the H1 style either way.
 */
@Component({
  selector: 'atlas-page-header',
  template: `
    <div class="text">
      <ng-content select="atlas-breadcrumbs" />
      @if (level() === 1) {
        <h1>{{ title() }}</h1>
      } @else {
        <h2 class="atlas-h1">{{ title() }}</h2>
      }
      @if (description(); as description) {
        <p class="description">{{ description }}</p>
      }
    </div>
    <div class="actions">
      <ng-content select="[pageHeaderAction]" />
    </div>
  `,
  styleUrl: './page-header.scss',
})
export class AtlasPageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly level = input<1 | 2>(1);
}
