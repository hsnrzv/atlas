import { Component, computed, effect, inject, input, LOCALE_ID, viewChildren } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { JOURNEY } from '../../core/layout/navigation';
import type { IkigaiAreaKey } from '../../core/models/life-dimension';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasStatusBadge } from '../../shared/ui/badge/status-badge';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasNextWaypointCard } from '../../shared/ui/next-waypoint-card/next-waypoint-card';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import {
  JOURNEY_RANGES,
  type JourneyRange,
} from '../../shared/visualization/journey-timeline/journey-scale';
import { AtlasJourneyTimeline } from '../../shared/visualization/journey-timeline/journey-timeline';
import { JourneyStore } from './data-access/journey.store';
import { toJourneyVm } from './data-access/journey.view-model';

const parseRange = (value: string | undefined): JourneyRange =>
  JOURNEY_RANGES.some((range) => range.value === value) ? (value as JourneyRange) : 'all';

/**
 * Journey Overview (F2-8, Figma page 10): Waypoints on a time axis from 768 px and as a chronological agenda below,
 * with the Next Waypoint and the Waypoints that are not placed yet.
 */
@Component({
  selector: 'atlas-journey-page',
  imports: [
    AtlasFeedbackState,
    AtlasIcon,
    AtlasJourneyTimeline,
    AtlasNextWaypointCard,
    AtlasPageHeader,
    AtlasProgress,
    AtlasStatusBadge,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  templateUrl: './journey-page.html',
  styleUrl: './journey-page.scss',
})
export class JourneyPage {
  // Bound from the query string (withComponentInputBinding).
  readonly range = input<string>();
  readonly dimension = input<string>();

  protected readonly title = JOURNEY.label;
  protected readonly ranges = JOURNEY_RANGES;
  protected readonly store = inject(JourneyStore);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly timelines = viewChildren(AtlasJourneyTimeline);

  protected readonly selectedRange = computed(() => parseRange(this.range()));
  protected readonly selectedDimension = computed(
    () => (this.dimension() as IkigaiAreaKey | undefined) ?? null,
  );
  protected readonly vm = computed(() => {
    const value = this.store.value();
    return value
      ? toJourneyVm(value, this.selectedDimension(), this.locale, this.store.sample)
      : null;
  });

  constructor() {
    effect(() => this.store.range.set(this.selectedRange()));
    this.store.enter();
    keepHeadingFocus(this.store.state);
  }

  protected setRange(range: JourneyRange): void {
    this.navigate({ range: range === 'all' ? null : range });
  }

  protected setDimension(value: IkigaiAreaKey | null): void {
    this.navigate({ dimension: value });
  }

  /** Brings today into view: the Today line on the timeline, or the first agenda item from this month on. */
  protected showToday(): void {
    for (const timeline of this.timelines()) {
      timeline.scrollToToday();
    }
    const vm = this.vm();
    if (!vm || typeof matchMedia !== 'function' || matchMedia('(min-width: 768px)').matches) {
      return;
    }
    const month = `${vm.today.date.slice(0, 7)}-01`;
    const item = vm.groups.flatMap((group) => group.agenda).find((entry) => entry.iso >= month);
    const link = item ? document.getElementById(`atlas-agenda-${item.id}`) : null;
    link?.scrollIntoView?.({ block: 'center' });
    link?.focus();
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
