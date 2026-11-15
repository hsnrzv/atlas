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
  templateUrl: './destination-card.html',
  styleUrl: './destination-card.scss',
})
export class AtlasDestinationCard {
  readonly destination = input.required<DestinationCardVm>();
}
