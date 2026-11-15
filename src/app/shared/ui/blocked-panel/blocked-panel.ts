import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AtlasIcon } from '../../icons/atlas-icon';

export interface BlockedReasonVm {
  readonly id: string;
  /** The prerequisite the node waits for. */
  readonly title: string;
  /** Its work status, e.g. "Not started". */
  readonly status: string;
  readonly link: string | null;
}

/**
 * Explains Blocked availability (Figma pages 07–08): which prerequisites a Waypoint or Step waits for, each with a
 * "View prerequisite" link. Availability is derived by the backend and is shown apart from the work status.
 */
@Component({
  selector: 'atlas-blocked-panel',
  imports: [AtlasIcon, RouterLink],
  templateUrl: './blocked-panel.html',
  styleUrl: './blocked-panel.scss',
})
export class AtlasBlockedPanel {
  readonly reasons = input.required<readonly BlockedReasonVm[]>();
  /** "Waypoint" or "Step". */
  readonly kind = input.required<string>();
  readonly heading = input('Blocked');
  readonly headingLevel = input<2 | 3>(2);
}
