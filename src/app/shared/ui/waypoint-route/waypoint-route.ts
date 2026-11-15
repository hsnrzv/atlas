import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { UiStatus } from '../../../core/models/status-for-node';
import { ATLAS_STATUSES } from '../../design-system/statuses';
import { AtlasIcon } from '../../icons/atlas-icon';
import { AtlasStatusBadge } from '../badge/status-badge';

export interface WaypointStopVm {
  readonly id: string;
  readonly title: string;
  readonly status: UiStatus;
  readonly blocked: boolean;
  /** Planned date with its precision, or "Date not set". */
  readonly dateText: string;
  readonly detail: string | null;
  readonly link: string;
  /** The next available Waypoint; marked "Next focus" and `aria-current`. */
  readonly current: boolean;
}

const COLORS = new Map(ATLAS_STATUSES.map((status) => [status.key, status.color]));
const ORDER = ATLAS_STATUSES.map((status) => status.key);

/**
 * Waypoints in order along a route line (Figma Atlas/V3/WaypointRoute, pages 06–07; native HTML/CSS, ADR-0004).
 * An ordered list, so assistive technology hears the sequence; status and Blocked are always text badges.
 */
@Component({
  selector: 'atlas-waypoint-route',
  imports: [AtlasIcon, AtlasStatusBadge, RouterLink],
  templateUrl: './waypoint-route.html',
  styleUrl: './waypoint-route.scss',
})
export class AtlasWaypointRoute {
  readonly stops = input.required<readonly WaypointStopVm[]>();
  /** Accessible name of the list. */
  readonly label = input.required<string>();
  readonly legend = input(false);

  /** Only the statuses that appear on this route, in the design-system order. */
  protected readonly legendItems = computed(() => {
    const present = new Set<UiStatus>();
    for (const stop of this.stops()) {
      present.add(stop.status);
      if (stop.blocked) {
        present.add('blocked');
      }
    }
    return ORDER.filter((key) => present.has(key));
  });

  protected color(status: UiStatus): string | undefined {
    return COLORS.get(status);
  }
}
