import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DIMENSIONS } from '../../core/layout/navigation';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDimensionBadge } from '../../shared/ui/badge/dimension-badge';
import { AtlasStatusBadge } from '../../shared/ui/badge/status-badge';
import { AtlasBreadcrumbs } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { DimensionsStore } from './data-access/dimensions.store';
import { toDimensionDetailVm } from './data-access/dimensions.view-model';

/**
 * One Life Dimension (P-D1, Figma page 13 `230:31837`): its active Destinations with progress, the next step and an
 * optional "Make it meaningful" prompt that starts a Destination in this dimension.
 */
@Component({
  selector: 'atlas-dimension-detail-page',
  imports: [
    AtlasBreadcrumbs,
    AtlasDimensionBadge,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasPageHeader,
    AtlasProgress,
    AtlasStatusBadge,
    MatButton,
    RouterLink,
  ],
  templateUrl: './dimension-detail-page.html',
  styleUrl: './dimension-detail-page.scss',
})
export class DimensionDetailPage {
  /** Route parameter: a Life Dimension key such as `career`. */
  readonly dimension = input.required<string>();

  protected readonly store = inject(DimensionsStore);
  protected readonly dimensions = DIMENSIONS;
  private readonly locale = inject(LOCALE_ID);

  protected readonly vm = computed(() => {
    const value = this.store.value();
    return value
      ? toDimensionDetailVm(this.dimension(), value, this.locale, this.store.sample)
      : null;
  });

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.store.state);
  }
}
