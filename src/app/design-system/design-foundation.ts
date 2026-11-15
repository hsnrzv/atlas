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
import { colorPrimitives, semanticColors } from '../shared/design-system/tokens.generated';
import { AtlasIcon } from '../shared/icons/atlas-icon';
import { ATLAS_ICONS, AtlasIconName } from '../shared/icons/atlas-icons';

interface Swatch {
  readonly name: string;
  readonly cssVar: string;
  readonly hex: string;
}

interface SemanticRole {
  readonly role: string;
  readonly cssVar: string;
  readonly dark: string;
  readonly light: string;
}

/** Figma V3 semantic roles in the order of the Foundations page (214:1925). */
const SEMANTIC_ROLES = [
  'surface.page',
  'surface.navigation',
  'surface.card',
  'surface.raised',
  'surface.subtle',
  'surface.hero',
  'surface.achievement',
  'text.primary',
  'text.secondary',
  'text.muted',
  'text.achievement',
  'action.primary',
  'action.primary-hover',
  'action.primary-pressed',
  'action.on-primary',
  'action.disabled',
  'action.on-disabled',
  'action.destructive',
  'border.subtle',
  'border.control',
  'border.action',
  'focus.ring',
  'progress.fill',
  'progress.track',
  'nav.active',
  'nav.active-accent',
] as const;

function semanticValue(theme: 'light' | 'dark', role: string): string {
  const value = role
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], semanticColors[theme]);
  return value as string;
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
    { title: 'Dark foundation', swatches: swatches('tide', colorPrimitives.tide) },
    { title: 'Forest', swatches: swatches('green', colorPrimitives.green) },
    { title: 'Violet', swatches: swatches('violet', colorPrimitives.violet) },
    { title: 'Achievement', swatches: swatches('gold', colorPrimitives.gold) },
    { title: 'Light foundation', swatches: swatches('light', colorPrimitives.light) },
    { title: 'Logo circles', swatches: swatches('brand venn', colorPrimitives.brand.venn) },
  ];

  protected readonly semanticRoles: readonly SemanticRole[] = SEMANTIC_ROLES.map((role) => ({
    role,
    cssVar: `--color-${role.replace('.', '-')}`,
    dark: semanticValue('dark', role),
    light: semanticValue('light', role),
  }));

  protected readonly typeStyles = [
    { name: 'display', sample: 'A clear path forward.' },
    { name: 'h1', sample: 'Build with intent.' },
    { name: 'h2', sample: 'One considered next step.' },
    { name: 'h3', sample: 'Upcoming Waypoints' },
    { name: 'h4', sample: 'Journey Overview' },
    { name: 'body-large', sample: 'Shape what matters across all seven Life Dimensions.' },
    { name: 'body', sample: 'Each Destination is reached through Waypoints and small Steps.' },
    { name: 'label', sample: 'Due in 3 days' },
    { name: 'control', sample: 'Explore waypoint' },
    { name: 'caption', sample: 'Updated 2 minutes ago' },
    { name: 'metric', sample: '20% · 2 of 10' },
  ] as const;

  protected readonly dimensions = LIFE_DIMENSIONS;
  protected readonly statuses = ATLAS_STATUSES;
  protected readonly iconNames = Object.keys(ATLAS_ICONS) as AtlasIconName[];
}
