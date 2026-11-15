import type { UiStatus } from '../../core/models/status-for-node';
import type { AtlasIconName } from '../icons/atlas-icons';

/** Map a backend node to a key with `statusForNode` (core/models). */
export type AtlasStatusKey = UiStatus;

/** Semantic progress status. Always render the label; colour and icon are reinforcement only. */
export interface AtlasStatus {
  readonly key: AtlasStatusKey;
  readonly label: string;
  readonly icon: AtlasIconName;
  /** Theme-aware foreground for the icon and the badge label (CSS custom property). */
  readonly color: string;
  /** Theme-aware badge background (CSS custom property). */
  readonly tint: string;
}

const LABELS: Record<AtlasStatusKey, string> = {
  success: 'Completed',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
  'at-risk': 'At risk',
  blocked: 'Blocked',
  'not-started': 'Not started',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
};

/**
 * Skipped and cancelled have no colour of their own in Figma V3 (roadmap R-13), so they reuse the neutral
 * not-started tokens and are told apart by icon and label.
 */
const COLOR_TOKEN: Record<AtlasStatusKey, string> = {
  success: 'success',
  'in-progress': 'in-progress',
  upcoming: 'upcoming',
  'at-risk': 'at-risk',
  blocked: 'blocked',
  'not-started': 'not-started',
  skipped: 'not-started',
  cancelled: 'not-started',
};

export const ATLAS_STATUSES: readonly AtlasStatus[] = (Object.keys(LABELS) as AtlasStatusKey[]).map(
  (key): AtlasStatus => ({
    key,
    label: LABELS[key],
    icon: `status-${key}`,
    color: `var(--color-status-${COLOR_TOKEN[key]})`,
    tint: `var(--color-status-${COLOR_TOKEN[key]}-tint)`,
  }),
);
