import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { UiStatus } from '../../../core/models/status-for-node';
import { AtlasStatusBadge } from '../badge/status-badge';

export interface StepRowVm {
  readonly id: string;
  readonly title: string;
  readonly status: UiStatus;
  /** Shown as a separate Blocked badge: availability is not status (Figma page 08). */
  readonly blocked: boolean;
  readonly meta: string;
  readonly link: string;
}

/**
 * One Step (Figma Atlas/V3/StepRow, page 08): title as a stretched link to Step detail, status, Blocked
 * availability and a meta line. Project row actions with `[stepRowAction]`; they sit above the stretched link.
 */
@Component({
  selector: 'atlas-step-row',
  imports: [AtlasStatusBadge, RouterLink],
  templateUrl: './step-row.html',
  styleUrl: './step-row.scss',
})
export class AtlasStepRow {
  readonly step = input.required<StepRowVm>();
}
