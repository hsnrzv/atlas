import { Component, computed, input } from '@angular/core';
import { LIFE_DIMENSIONS } from '../../design-system/life-dimensions';
import type { LifeDimensionKey } from '../../design-system/tokens.generated';
import { AtlasIcon } from '../../icons/atlas-icon';

const BY_KEY = new Map(LIFE_DIMENSIONS.map((dimension) => [dimension.key, dimension]));

/** Life Dimension tag (Figma Atlas/V3/DimensionBadge 152:2409): icon and name on the dimension tint. */
@Component({
  selector: 'atlas-dimension-badge',
  imports: [AtlasIcon],
  templateUrl: './dimension-badge.html',
  styleUrl: './dimension-badge.scss',
  host: {
    '[style.--atlas-badge-foreground]': 'meta().color.foreground',
    '[style.--atlas-badge-background]': 'meta().color.tint',
  },
})
export class AtlasDimensionBadge {
  readonly dimension = input.required<LifeDimensionKey>();

  protected readonly meta = computed(() => BY_KEY.get(this.dimension())!);
}
