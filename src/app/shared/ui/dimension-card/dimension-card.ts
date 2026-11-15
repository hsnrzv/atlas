import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { LIFE_DIMENSIONS } from '../../design-system/life-dimensions';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import { AtlasIcon } from '../../icons/atlas-icon';

const BY_KEY = new Map(LIFE_DIMENSIONS.map((dimension) => [dimension.key, dimension]));

/**
 * One Life Dimension on My Atlas (Figma Atlas/V3/DimensionCard 152:2455): icon, name, how many active Destinations
 * it has and the backend-derived progress. A dimension without Destinations shows 0 % and an empty track.
 */
@Component({
  selector: 'atlas-dimension-card',
  imports: [AtlasIcon],
  templateUrl: './dimension-card.html',
  styleUrl: './dimension-card.scss',
  host: { '[style.--atlas-dimension-color]': 'meta().color.foreground' },
})
export class AtlasDimensionCard {
  readonly dimension = input.required<LifeDimensionKey>();
  /** Active Destinations in this dimension (backend count). */
  readonly destinations = input(0);
  /** Backend percentage, or `null` when the dimension has no progress yet. */
  readonly progress = input<number | null>(null);

  private readonly percent = new Intl.NumberFormat(inject(LOCALE_ID), {
    style: 'percent',
    maximumFractionDigits: 0,
  });

  protected readonly meta = computed(() => BY_KEY.get(this.dimension())!);
  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.progress() ?? 0)));
  protected readonly percentText = computed(() => this.percent.format(this.clamped() / 100));
  protected readonly countText = computed(() => {
    const count = this.destinations();
    if (count === 0) {
      return 'No destinations yet';
    }
    return count === 1 ? '1 destination' : `${count} destinations`;
  });
}
