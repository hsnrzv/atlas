import type { AtlasIconName } from '../icons/atlas-icons';
import { statusColors } from './tokens.generated';

export type AtlasStatusKey = keyof typeof statusColors;

/** Semantic progress status. Always render the label; colour and icon are reinforcement only. */
export interface AtlasStatus {
  readonly key: AtlasStatusKey;
  readonly label: string;
  readonly icon: AtlasIconName;
  /** Icon/indicator colour (CSS custom property). Labels use `--color-text-secondary`. */
  readonly color: string;
}

const LABELS: Record<AtlasStatusKey, string> = {
  success: 'Completed',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
  'at-risk': 'At risk',
  blocked: 'Blocked',
  'not-started': 'Not started',
};

export const ATLAS_STATUSES: readonly AtlasStatus[] = (Object.keys(LABELS) as AtlasStatusKey[]).map(
  (key): AtlasStatus => ({
    key,
    label: LABELS[key],
    icon: `status-${key}`,
    color: `var(--color-status-${key})`,
  }),
);
