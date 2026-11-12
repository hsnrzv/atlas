import { Component, computed, input } from '@angular/core';
import { TablerIconComponent } from '@tabler/icons-angular';
import { ATLAS_ICONS, AtlasIconName } from './atlas-icons';

export type AtlasIconSize = 'xs' | 'sm' | 'md' | 'lg';

/** Icon sizes in px (design/tokens/spacing.json → size.icon). */
export const ATLAS_ICON_SIZES: Record<AtlasIconSize, number> = { xs: 16, sm: 18, md: 20, lg: 24 };

/** Default outline stroke (design/tokens/spacing.json → size.icon-stroke). */
export const ATLAS_ICON_STROKE = 1.75;

/**
 * Renders an Atlas icon. Decorative by default (hidden from assistive technology);
 * pass `label` when the icon conveys meaning on its own. Colour follows `currentColor`.
 *
 * ```html
 * <atlas-icon name="destinations" size="lg" />
 * <atlas-icon name="status-blocked" label="Blocked" />
 * ```
 */
@Component({
  selector: 'atlas-icon',
  imports: [TablerIconComponent],
  template: `<tabler-icon [icon]="icon()" [size]="px()" [stroke]="stroke()" />`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      line-height: 0;
      color: inherit;
    }
  `,
  host: {
    class: 'atlas-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class AtlasIcon {
  readonly name = input.required<AtlasIconName>();
  readonly size = input<AtlasIconSize>('md');
  readonly stroke = input<number>(ATLAS_ICON_STROKE);
  /** Accessible name. Omit for decorative icons next to visible text. */
  readonly label = input<string>();

  protected readonly icon = computed(() => ATLAS_ICONS[this.name()]);
  protected readonly px = computed(() => ATLAS_ICON_SIZES[this.size()]);
}
