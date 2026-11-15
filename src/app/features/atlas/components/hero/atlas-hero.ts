import { Component, input } from '@angular/core';
import { AtlasProgress } from '../../../../shared/ui/progress/progress';

let nextId = 0;

/**
 * "Life with intent" hero (Figma page 05 `214:2602`): the intent message beside the Destination progress. Below 1024 px
 * (mobile and tablet frames) it becomes compact: no eyebrow and no large metric, just the message, progress and Waypoints achieved.
 */
@Component({
  selector: 'atlas-hero',
  imports: [AtlasProgress],
  template: `
    <div class="intent">
      <p class="eyebrow">My Atlas · Your life, with intent</p>
      <h2 class="title" [id]="titleId">Build the life you envision.</h2>
      <p class="lead">A meaningful destination starts with one next step.</p>
    </div>
    <div class="summary">
      <p class="eyebrow">Your destination</p>
      <p class="metric" aria-hidden="true">{{ percentText() }}</p>
      <atlas-progress
        class="progress"
        label="Destination progress"
        [value]="percent()"
        [detail]="detail()"
      />
      <p class="achieved">{{ achieved() }}</p>
    </div>
  `,
  styleUrl: './atlas-hero.scss',
  host: { role: 'region', '[attr.aria-labelledby]': 'titleId' },
})
export class AtlasHero {
  /** Backend Destination percentage. */
  readonly percent = input.required<number>();
  readonly percentText = input.required<string>();
  readonly detail = input<string>();
  readonly achieved = input.required<string>();

  protected readonly titleId = `atlas-hero-${nextId++}`;
}
