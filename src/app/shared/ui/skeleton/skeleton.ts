import { Component, computed, input } from '@angular/core';

/**
 * Loading placeholder bars (Figma Atlas/V3/FeedbackState, Loading). Decorative: the surrounding region announces
 * the loading state (`aria-busy` or a status message). The shimmer stops under `prefers-reduced-motion`.
 */
@Component({
  selector: 'atlas-skeleton',
  template: `
    @for (line of lineList(); track $index) {
      <span class="bar" [class.is-short]="$last && lineList().length > 1"></span>
    }
  `,
  styleUrl: './skeleton.scss',
  host: { 'aria-hidden': 'true' },
})
export class AtlasSkeleton {
  readonly lines = input(3);

  protected readonly lineList = computed(() => Array.from({ length: Math.max(1, this.lines()) }));
}
