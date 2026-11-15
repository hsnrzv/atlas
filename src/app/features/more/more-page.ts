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
  templateUrl: './more-page.html',
  styleUrl: './more-page.scss',
})
export class MorePage {
  protected readonly home = MY_ATLAS;
  protected readonly groups = MORE_GROUPS;
}
