import { Component, input } from '@angular/core';

export interface GlanceItem {
  readonly value: string;
  readonly label: string;
}

let nextId = 0;

/** "At a glance" (Figma Atlas/V3/Summary/At a glance): a few backend counts, value first. */
@Component({
  selector: 'atlas-glance-summary',
  template: `
    <h2 class="title" [id]="titleId">At a glance</h2>
    <ul class="rows" role="list">
      @for (item of items(); track item.label) {
        <li class="row">
          <span class="value">{{ item.value }}</span>
          <span class="label">{{ item.label }}</span>
        </li>
      }
    </ul>
  `,
  styleUrl: './glance-summary.scss',
  host: { role: 'region', '[attr.aria-labelledby]': 'titleId' },
})
export class AtlasGlanceSummary {
  readonly items = input.required<readonly GlanceItem[]>();

  protected readonly titleId = `atlas-glance-${nextId++}`;
}
