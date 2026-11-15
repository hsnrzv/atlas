import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';

/**
 * Linear progress (Figma Atlas/V3/Progress 152:2358). Shows a value the backend has derived; the frontend never
 * computes progress. The visible text ("20% · 2 of 10") is also the accessible value text.
 */
@Component({
  selector: 'atlas-progress',
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class AtlasProgress {
  /** Backend-provided percentage, 0–100. */
  readonly value = input.required<number>();
  /** What is measured, e.g. "Destination progress". Becomes the accessible name. */
  readonly label = input.required<string>();
  /** Optional backend-provided detail, e.g. "2 of 10 Waypoints". */
  readonly detail = input<string>();

  private readonly percent = new Intl.NumberFormat(inject(LOCALE_ID), {
    style: 'percent',
    maximumFractionDigits: 0,
  });

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly valueText = computed(() => {
    const percent = this.percent.format(this.clamped() / 100);
    const detail = this.detail();
    return detail ? `${percent} · ${detail}` : percent;
  });
}
