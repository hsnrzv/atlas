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
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="list" role="list">
        @for (item of items(); track $index; let last = $last) {
          <li class="item">
            @if (!last && item.path) {
              <a class="link" [routerLink]="item.path">{{ item.label }}</a>
              <atlas-icon class="separator" name="expand" size="lg" />
            } @else {
              <span class="current" [attr.aria-current]="last ? 'page' : null">{{
                item.label
              }}</span>
              @if (!last) {
                <atlas-icon class="separator" name="expand" size="lg" />
              }
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumbs.scss',
})
export class AtlasBreadcrumbs {
  readonly items = input.required<readonly AtlasBreadcrumb[]>();
}
