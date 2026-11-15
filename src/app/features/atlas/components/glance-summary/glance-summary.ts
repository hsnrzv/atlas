import { Component, input } from '@angular/core';

export interface GlanceItem {
  readonly value: string;
  readonly label: string;
}

let nextId = 0;

/** "At a glance" (Figma Atlas/V3/Summary/At a glance): a few backend counts, value first. */
@Component({
  selector: 'atlas-glance-summary',
  templateUrl: './glance-summary.html',
  styleUrl: './glance-summary.scss',
  host: { role: 'region', '[attr.aria-labelledby]': 'titleId' },
})
export class AtlasGlanceSummary {
  readonly items = input.required<readonly GlanceItem[]>();

  protected readonly titleId = `atlas-glance-${nextId++}`;
}
