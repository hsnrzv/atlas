import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PlannedDate } from '../../../core/models/planned-date';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import type { AtlasStatusKey } from '../../design-system/statuses';
import { AtlasDimensionBadge } from '../badge/dimension-badge';
import { AtlasStatusBadge } from '../badge/status-badge';
import { AtlasDateLabel } from '../date-label/date-label';
import { AtlasProgress } from '../progress/progress';

export interface DestinationCardVm {
  readonly id: string;
  readonly title: string;
  readonly dimension: LifeDimensionKey;
  readonly status: AtlasStatusKey;
  /** Backend percentage and its "2 of 10" detail. */
  readonly progress: { readonly value: number; readonly detail?: string };
  readonly nextWaypoint: string | null;
  readonly targetDate: PlannedDate | null;
  readonly link: string;
}

/**
 * A Destination in a list (component catalog `atlas-destination-card`). The whole card is one link named by its
 * heading (stretched link), so it is a single tab stop; badges, progress and dates are read as its content.
 */
@Component({
  selector: 'atlas-destination-card',
  imports: [AtlasDateLabel, AtlasDimensionBadge, AtlasProgress, AtlasStatusBadge, RouterLink],
  template: `
    <div class="badges">
      <atlas-dimension-badge [dimension]="destination().dimension" />
      <atlas-status-badge [status]="destination().status" />
    </div>
    <h3 class="title">
      <a class="link" [routerLink]="destination().link">{{ destination().title }}</a>
    </h3>
    <atlas-progress
      label="Destination progress"
      [value]="destination().progress.value"
      [detail]="destination().progress.detail"
    />
    <dl class="facts">
      <div>
        <dt>Next Waypoint</dt>
        <dd>{{ destination().nextWaypoint ?? 'None planned' }}</dd>
      </div>
      <div>
        <dt>Target</dt>
        <dd>
          @if (destination().targetDate; as date) {
            <atlas-date-label [date]="date" format="long" />
          } @else {
            Date not set
          }
        </dd>
      </div>
    </dl>
  `,
  styleUrl: './destination-card.scss',
})
export class AtlasDestinationCard {
  readonly destination = input.required<DestinationCardVm>();
}
