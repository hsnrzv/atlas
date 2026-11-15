import { Component, input } from '@angular/core';
import { AtlasIcon } from '../../icons/atlas-icon';
import type { AtlasIconName } from '../../icons/atlas-icons';

export type AtlasIconButtonSize = 'compact' | 'default';
export type AtlasIconButtonAppearance = 'outlined' | 'ghost';

/**
 * Square icon-only control (Figma Atlas/V3/IconButton 152:5980): 48 px (44 px compact), control radius,
 * raised surface with a control border. `ghost` drops the surface and border, as in the Figma top bar (152:5155). `aria-label` is a required input, so every instance has an accessible name.
 */
@Component({
  selector: 'button[atlas-icon-button], a[atlas-icon-button]',
  imports: [AtlasIcon],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
  host: {
    class: 'atlas-icon-button',
    '[class.is-compact]': 'size() === "compact"',
    '[class.is-ghost]': 'appearance() === "ghost"',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class AtlasIconButton {
  readonly icon = input.required<AtlasIconName>();
  readonly ariaLabel = input.required<string>({ alias: 'aria-label' });
  readonly size = input<AtlasIconButtonSize>('default');
  readonly appearance = input<AtlasIconButtonAppearance>('outlined');
}
