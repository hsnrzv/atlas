import type { AtlasIconName } from '../icons/atlas-icons';
import { LIFE_DIMENSION_KEYS, LifeDimensionKey, lifeDimensionMeta } from './tokens.generated';

export type LifeDimensionApiKey = (typeof lifeDimensionMeta)[LifeDimensionKey]['apiKey'];

/**
 * Presentation metadata for one Life Dimension (domain: Ikigai area). Colours are CSS custom
 * properties so they follow the active theme; never hard-code dimension hex values in features.
 */
export interface LifeDimension {
  readonly key: LifeDimensionKey;
  /** Enum value used by the backend API (`/api/v1`). */
  readonly apiKey: LifeDimensionApiKey;
  readonly label: string;
  readonly longLabel: string;
  readonly icon: AtlasIconName;
  readonly color: {
    /** Theme-aware foreground for text, icons, strokes and chart series (≥ 4.5:1 on its tint). */
    readonly foreground: string;
    /** Theme-aware background for chips, badges and panels. */
    readonly tint: string;
  };
}

/** The seven Life Dimensions in canonical order (clockwise on the logo, from north). */
export const LIFE_DIMENSIONS: readonly LifeDimension[] = LIFE_DIMENSION_KEYS.map(
  (key): LifeDimension => ({
    key,
    apiKey: lifeDimensionMeta[key].apiKey,
    label: lifeDimensionMeta[key].label,
    longLabel: lifeDimensionMeta[key].longLabel,
    icon: key,
    color: {
      foreground: `var(--color-dimension-${key})`,
      tint: `var(--color-dimension-${key}-tint)`,
    },
  }),
);

const BY_API_KEY = new Map(LIFE_DIMENSIONS.map((dimension) => [dimension.apiKey, dimension]));

/** Resolves a backend enum value (e.g. `"HEALTH"`) to its presentation metadata. */
export function lifeDimensionByApiKey(apiKey: string): LifeDimension | undefined {
  return BY_API_KEY.get(apiKey as LifeDimensionApiKey);
}
