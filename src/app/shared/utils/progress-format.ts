import type { Progress } from '../../core/models/progress';

/** Backend percent string ("20.0") as a number for the progress bar; never recalculated (frontend.md §6.3). */
export const percentValue = (progress: Progress | null | undefined): number =>
  progress ? Number(progress.percent) || 0 : 0;

/** "2 of 10", from the backend's counted and total weight. */
export const progressDetail = (progress: Progress | null | undefined): string | undefined =>
  progress?.countedWeight !== undefined && progress.totalWeight !== undefined
    ? `${progress.countedWeight} of ${progress.totalWeight}`
    : undefined;

/** "40%" in the user's locale, from the backend percent. */
export function formatPercent(progress: Progress | null | undefined, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
    percentValue(progress) / 100,
  );
}
