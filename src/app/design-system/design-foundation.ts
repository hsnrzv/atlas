import { DOCUMENT } from '@angular/common';
import { Component, inject, LOCALE_ID, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AtlasLogo } from '../shared/brand/atlas-logo';
import { AtlasTheme } from '../core/theme/atlas-theme';
import { LIFE_DIMENSIONS } from '../shared/design-system/life-dimensions';
import { ATLAS_STATUSES } from '../shared/design-system/statuses';
import { colorPrimitives, semanticColors } from '../shared/design-system/tokens.generated';
import { AtlasIcon } from '../shared/icons/atlas-icon';
import { ATLAS_ICONS, AtlasIconName } from '../shared/icons/atlas-icons';
import { AtlasDimensionBadge } from '../shared/ui/badge/dimension-badge';
import { AtlasStatusBadge } from '../shared/ui/badge/status-badge';
import { AtlasBreadcrumbs } from '../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasDateLabel, PlannedDate } from '../shared/ui/date-label/date-label';
import {
  AtlasDestinationCard,
  type DestinationCardVm,
} from '../shared/ui/destination-card/destination-card';
import { AtlasCompanionCard } from '../shared/ui/companion-card/companion-card';
import { AtlasDimensionCard } from '../shared/ui/dimension-card/dimension-card';
import { AtlasFeedbackState } from '../shared/ui/feedback-state/feedback-state';
import { AtlasIconButton } from '../shared/ui/icon-button/icon-button';
import {
  AtlasNextWaypointCard,
  type NextWaypointVm,
} from '../shared/ui/next-waypoint-card/next-waypoint-card';
import { AtlasPageHeader } from '../shared/ui/page-header/page-header';
import { AtlasPopover, AtlasPopoverTrigger } from '../shared/ui/popover/popover';
import { AtlasProgress } from '../shared/ui/progress/progress';
import { AtlasSearchField } from '../shared/ui/search-field/search-field';
import {
  AtlasConnectionGraph,
  type ConnectionGraphEdge,
  type ConnectionGraphNode,
} from '../shared/visualization/connection-graph/connection-graph';
import { journeyScale } from '../shared/visualization/journey-timeline/journey-scale';
import {
  AtlasJourneyTimeline,
  type JourneyLane,
} from '../shared/visualization/journey-timeline/journey-timeline';

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
  'nav.bottom-active-accent',
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
 * theme changes can be reviewed in one place. Served at `/_design` in development builds only.
 */
@Component({
  selector: 'atlas-design-foundation',
  imports: [
    AtlasBreadcrumbs,
    AtlasCompanionCard,
    AtlasConnectionGraph,
    AtlasDateLabel,
    AtlasDestinationCard,
    AtlasDimensionBadge,
    AtlasDimensionCard,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasIconButton,
    AtlasJourneyTimeline,
    AtlasLogo,
    AtlasNextWaypointCard,
    AtlasPageHeader,
    AtlasPopover,
    AtlasPopoverTrigger,
    AtlasProgress,
    AtlasSearchField,
    AtlasStatusBadge,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltip,
    RouterLink,
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

  /** Illustrative planned dates; real values and their precision come from the backend. */
  protected readonly plannedDates: readonly PlannedDate[] = [
    { date: '2026-12-14', precision: 'DAY' },
    { date: '2026-12-01', precision: 'MONTH' },
    { date: '2027-07-01', precision: 'QUARTER' },
    { date: '2030-01-01', precision: 'YEAR' },
    { date: '2027-09-15', precision: 'APPROXIMATE' },
  ];

  /** Illustrative card content; on real pages every value comes from the backend. */
  protected readonly sampleWaypoint: NextWaypointVm = {
    id: 'demo-waypoint',
    title: 'Submit application',
    dimension: 'career',
    status: 'in-progress',
    plannedDate: { date: '2026-12-01', precision: 'MONTH' },
    progress: { value: 40, detail: '2 of 5' },
    link: '/_design',
  };

  protected readonly sampleDestination: DestinationCardVm = {
    id: 'demo-destination',
    title: 'Complete an online Master’s degree',
    dimension: 'career',
    status: 'in-progress',
    progress: { value: 20, detail: '2 of 10' },
    nextWaypoint: 'Submit application',
    targetDate: { date: '2030-01-01', precision: 'YEAR' },
    link: '/_design',
  };

  private readonly document = inject(DOCUMENT);

  /** `href="#main"` would resolve against `<base href>` and leave the page, so focus the target directly. */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main')?.focus();
  }

  protected readonly sampleGraphNodes: readonly ConnectionGraphNode[] = [
    {
      id: 'demo-goal',
      column: 'source',
      label: 'Master’s degree',
      caption: 'Destination',
      icon: 'destinations',
      dimension: null,
      accessibleName: 'Master’s degree, Destination, 2 relationships',
    },
    {
      id: 'demo-career',
      column: 'target',
      label: 'Career',
      caption: 'Association',
      icon: 'career',
      dimension: 'career',
      accessibleName: 'Career, 1 relationship',
    },
    {
      id: 'demo-finance',
      column: 'target',
      label: 'Finance',
      caption: 'Possible impact',
      icon: 'finance',
      dimension: 'finance',
      accessibleName: 'Finance, 1 relationship',
    },
  ];

  protected readonly sampleGraphEdges: readonly ConnectionGraphEdge[] = [
    { id: 'demo-edge-1', source: 'demo-goal', target: 'demo-career', line: 'solid' },
    { id: 'demo-edge-2', source: 'demo-goal', target: 'demo-finance', line: 'dashed' },
  ];

  protected readonly selectedGraphNode = signal<string | null>(null);

  protected readonly sampleLanes: readonly JourneyLane[] = [
    {
      id: 'demo-lane-1',
      label: 'Submit application',
      date: '2026-12-01',
      caption: 'Dec 2026 · month',
      marker: 'solid',
      dimension: 'career',
      link: '/_design',
      accessibleName: 'Submit application, December 2026, month precision, In progress',
    },
    {
      id: 'demo-lane-2',
      label: 'Graduate',
      date: '2030-01-01',
      caption: '2030 · year',
      marker: 'dashed',
      dimension: 'career',
      link: '/_design',
      accessibleName: 'Graduate, 2030, year precision, Upcoming',
    },
  ];

  protected readonly sampleScale = journeyScale(
    'all',
    '2026-11-12',
    this.sampleLanes.map((lane) => lane.date),
    inject(LOCALE_ID),
  );
}
