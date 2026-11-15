import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AtlasIcon } from '../../icons/atlas-icon';

export interface AtlasBreadcrumb {
  readonly label: string;
  /** Omitted for the current page (the last item). */
  readonly path?: string;
}

/** Location trail (Figma Atlas/V3/Breadcrumb 152:6111). The last item is the current page. */
@Component({
  selector: 'atlas-breadcrumbs',
  imports: [AtlasIcon, RouterLink],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class AtlasBreadcrumbs {
  readonly items = input.required<readonly AtlasBreadcrumb[]>();
}
