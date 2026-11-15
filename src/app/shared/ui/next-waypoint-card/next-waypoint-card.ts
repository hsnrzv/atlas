import { Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import type { PlannedDate } from '../../../core/models/planned-date';
import type { AtlasStatusKey } from '../../design-system/statuses';
import { LIFE_DIMENSIONS } from '../../design-system/life-dimensions';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import { AtlasIcon } from '../../icons/atlas-icon';
import { precisionLabel } from '../../utils/planned-date-format';
import { AtlasStatusBadge } from '../badge/status-badge';
import { AtlasDateLabel } from '../date-label/date-label';
import { AtlasProgress } from '../progress/progress';

/** Everything the card shows; values are backend-derived and only formatted here. */
export interface NextWaypointVm {
  readonly id: string;
  readonly title: string;
  readonly dimension: LifeDimensionKey;
  readonly status: AtlasStatusKey;
  readonly plannedDate: PlannedDate | null;
  /** Backend percentage and its "2 of 5" detail; `null` when the backend reports none. */
  readonly progress: { readonly value: number; readonly detail?: string } | null;
  readonly link: string;
}

let nextId = 0;
const LABELS = new Map(LIFE_DIMENSIONS.map((dimension) => [dimension.key, dimension.label]));

/**
 * The one Waypoint to work on next (Figma Atlas/V3/Focus/NextWaypoint, page 05 `214:2602`): dimension label, title
 * with status, planned date with its precision, progress and the "Explore next waypoint" action.
 */
@Component({
  selector: 'atlas-next-waypoint-card',
  imports: [AtlasDateLabel, AtlasIcon, AtlasProgress, AtlasStatusBadge, MatButton, RouterLink],
  template: `
    <p class="eyebrow">Next Waypoint · {{ dimensionLabel() }}</p>
    <div class="heading">
      <h3 class="title" [id]="titleId">{{ waypoint().title }}</h3>
      <atlas-status-badge [status]="waypoint().status" />
    </div>
    <p class="planned">
      @if (waypoint().plannedDate; as date) {
        Planned <atlas-date-label [date]="date" format="long" />
        @if (precision(); as precision) {
          · {{ precision }}
        }
      } @else {
        Date not set
      }
    </p>
    @if (waypoint().progress; as progress) {
      <atlas-progress
        class="progress"
        label="Waypoint progress"
        [value]="progress.value"
        [detail]="progress.detail"
      />
    }
    <a
      mat-flat-button
      class="action"
      [routerLink]="waypoint().link"
      [attr.aria-describedby]="titleId"
    >
      Explore next waypoint
      <atlas-icon matButtonIcon iconPositionEnd name="next" size="lg" />
    </a>
  `,
  styleUrl: './next-waypoint-card.scss',
})
export class AtlasNextWaypointCard {
  readonly waypoint = input.required<NextWaypointVm>();

  protected readonly titleId = `atlas-next-waypoint-${nextId++}`;
  protected readonly dimensionLabel = computed(() => LABELS.get(this.waypoint().dimension));
  protected readonly precision = computed(() => {
    const date = this.waypoint().plannedDate;
    return date ? precisionLabel(date.precision) : null;
  });
}
