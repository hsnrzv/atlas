import { Component, computed, inject, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AtlasDimensionCard } from '../../shared/ui/dimension-card/dimension-card';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { DimensionsStore } from './data-access/dimensions.store';
import { toDimensionsVm } from './data-access/dimensions.view-model';

/**
 * Life Dimensions (P-D1, Figma page 13 `230:26744`): all seven dimensions with the backend's Destination counts and
 * progress. A dimension with Destinations opens its page; the others offer "Add intention".
 */
@Component({
  selector: 'atlas-dimensions-page',
  imports: [AtlasDimensionCard, AtlasFeedbackState, AtlasPageHeader, MatButton, RouterLink],
  templateUrl: './dimensions-page.html',
  styleUrl: './dimensions-page.scss',
})
export class DimensionsPage {
  protected readonly store = inject(DimensionsStore);
  private readonly locale = inject(LOCALE_ID);

  protected readonly vm = computed(() => {
    const value = this.store.value();
    return value ? toDimensionsVm(value, this.locale, this.store.sample) : null;
  });

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.store.state);
  }
}
