import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { IsoDate } from '../../../core/models/planned-date';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import type { JourneyScale } from './journey-scale';

export interface JourneyLane {
  readonly id: string;
  /** Lane heading, the Waypoint title. */
  readonly label: string;
  readonly date: IsoDate;
  /** "Dec 2026 · month", shown beside the marker. */
  readonly caption: string;
  /** Solid for a day or month target; dashed and hollow for a coarse or approximate date. */
  readonly marker: 'solid' | 'dashed';
  readonly dimension: LifeDimensionKey;
  readonly link: string;
  /** "Submit application, December 2026, month precision, In progress". */
  readonly accessibleName: string;
}

/**
 * Journey timeline (F2-8, Figma page 10 `230:32816`): one lane per dated Waypoint on a linear time axis with a
 * Today line. Positions are drawing only; dates, precision and status come from the backend. Each marker is a link
 * with the full date and status as its name, so the axis and lines can stay decorative.
 */
@Component({
  selector: 'atlas-journey-timeline',
  imports: [RouterLink],
  templateUrl: './journey-timeline.html',
  styleUrl: './journey-timeline.scss',
})
export class AtlasJourneyTimeline {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly lanes = input.required<readonly JourneyLane[]>();
  readonly scale = input.required<JourneyScale>();
  /** Backend `today` and its label, e.g. "Today · 12 Nov 2026". */
  readonly today = input.required<{ readonly date: IsoDate; readonly label: string }>();
  readonly label = input('Journey timeline');

  protected readonly todayOffset = computed(() => {
    const { date } = this.today();
    const { start, end } = this.scale();
    return date >= start && date <= end ? this.scale().offset(date) : null;
  });

  protected readonly placed = computed(() =>
    this.lanes().map((lane) => {
      const offset = this.scale().offset(lane.date);
      return { lane, offset, end: offset > 66 };
    }),
  );

  /** Scrolls the Today line into view (Figma "Today"). */
  scrollToToday(): void {
    this.host.nativeElement
      .querySelector('.today')
      ?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }
}
