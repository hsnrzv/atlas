import { Component, computed, input } from '@angular/core';
import { ATLAS_STATUSES, AtlasStatusKey } from '../../design-system/statuses';
import { AtlasIcon } from '../../icons/atlas-icon';

const BY_KEY = new Map(ATLAS_STATUSES.map((status) => [status.key, status]));

/** Progress status (Figma Atlas/V3/StatusBadge 152:2374). The label always shows; colour and icon reinforce it. */
@Component({
  selector: 'atlas-status-badge',
  imports: [AtlasIcon],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  host: {
    '[style.--atlas-badge-foreground]': 'meta().color',
    '[style.--atlas-badge-background]': 'meta().tint',
  },
})
export class AtlasStatusBadge {
  readonly status = input.required<AtlasStatusKey>();
  /** Overrides the vocabulary label, e.g. "Draft" or "Paused" for a Destination. */
  readonly label = input<string>();

  protected readonly meta = computed(() => BY_KEY.get(this.status()) ?? BY_KEY.get('not-started')!);
}
