import { Component, input } from '@angular/core';

/**
 * Page title block (Figma Atlas/V3/PageHeader 152:6139). Renders the page `h1`; the shell moves focus to it after
 * navigation. Project a primary action with a `pageHeaderAction` attribute; it sits on the right from 768 px and
 * full width below. Project `<atlas-breadcrumbs>` to show the trail above the title. `level` 2 is only for
 * previews and nested panels that must not add a second `h1`; the title keeps the H1 style either way.
 */
@Component({
  selector: 'atlas-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class AtlasPageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly level = input<1 | 2>(1);
}
