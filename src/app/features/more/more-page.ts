import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MORE_GROUPS, MY_ATLAS } from '../../core/layout/navigation';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';

/**
 * Mobile "More" page (Figma page 05, 230:24819 / 230:24964): the areas that do not fit in the bottom navigation.
 * A page rather than a sheet, so every area keeps a real URL and the back button works.
 */
@Component({
  selector: 'atlas-more-page',
  imports: [AtlasIcon, AtlasPageHeader, MatButton, RouterLink],
  template: `
    <atlas-page-header title="More of your Atlas" description="Explore the rest of your journey." />

    <a mat-stroked-button class="back" [routerLink]="home.path">
      <atlas-icon matButtonIcon name="back" size="md" />
      Back to {{ home.label }}
    </a>

    @for (group of groups; track group.label) {
      <section class="group" [attr.aria-labelledby]="'more-' + $index">
        <h2 class="group-label" [id]="'more-' + $index">{{ group.label }}</h2>
        <ul class="rows" role="list">
          @for (link of group.links; track link.path) {
            <li>
              <a class="row" [routerLink]="link.path">
                <atlas-icon class="row-icon" [name]="link.icon" size="md" />
                <span class="row-label">{{ link.label }}</span>
                <atlas-icon class="row-chevron" name="expand" size="md" />
              </a>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styleUrl: './more-page.scss',
})
export class MorePage {
  protected readonly home = MY_ATLAS;
  protected readonly groups = MORE_GROUPS;
}
