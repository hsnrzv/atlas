import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AtlasLogo } from '../shared/brand/atlas-logo';
import { AtlasTheme } from '../shared/design-system/atlas-theme';
import { LIFE_DIMENSIONS } from '../shared/design-system/life-dimensions';
import { ATLAS_STATUSES } from '../shared/design-system/statuses';
import { colorPrimitives } from '../shared/design-system/tokens.generated';
import { AtlasIcon } from '../shared/icons/atlas-icon';
import { ATLAS_ICONS, AtlasIconName } from '../shared/icons/atlas-icons';

interface Swatch {
  readonly name: string;
  readonly cssVar: string;
  readonly hex: string;
}

function swatches(group: string, scale: Record<string, string>): Swatch[] {
  return Object.entries(scale).map(([step, hex]) => ({
    name: `${group} ${step}`,
    cssVar: `--color-${group.replace(' ', '-')}-${step}`,
    hex,
  }));
}

/**
 * Design foundation reference page (design steps 1–3). Renders every token-driven primitive so
 * theme changes can be reviewed in one place. Replaced as the root route by the app shell (step 4).
 */
@Component({
  selector: 'atlas-design-foundation',
  imports: [
    AtlasIcon,
    AtlasLogo,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './design-foundation.html',
  styleUrl: './design-foundation.scss',
})
export class DesignFoundation {
  protected readonly theme = inject(AtlasTheme);

  protected readonly palettes = [
    { title: 'Midnight', swatches: swatches('brand midnight', colorPrimitives.brand.midnight) },
    { title: 'Ivory', swatches: swatches('brand ivory', colorPrimitives.brand.ivory) },
    { title: 'Gold', swatches: swatches('brand gold', colorPrimitives.brand.gold) },
    { title: 'Neutral', swatches: swatches('neutral', colorPrimitives.neutral) },
  ];

  protected readonly typeStyles = [
    { name: 'display', sample: 'See the whole.' },
    { name: 'h1', sample: 'My Atlas' },
    { name: 'h2', sample: "Complete an online Master's degree" },
    { name: 'h3', sample: 'Upcoming Waypoints' },
    { name: 'h4', sample: 'Journey Overview' },
    { name: 'body-large', sample: 'Shape what matters across all seven Life Dimensions.' },
    { name: 'body', sample: 'Each Destination is reached through Waypoints and small Steps.' },
    { name: 'label', sample: 'Due in 3 days' },
    { name: 'caption', sample: 'Updated 2 minutes ago' },
    { name: 'metric', sample: '72%' },
  ] as const;

  protected readonly dimensions = LIFE_DIMENSIONS;
  protected readonly statuses = ATLAS_STATUSES;
  protected readonly iconNames = Object.keys(ATLAS_ICONS) as AtlasIconName[];
}
