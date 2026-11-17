import { Component, computed, input } from '@angular/core';
import { COMPANION_ART, type CompanionExpression } from '../../../core/companion/companion-copy';
import { AtlasLogo } from '../../brand/atlas-logo';

export type CompanionAvatarSize = 'compact' | 'expanded' | 'welcome';

const LOGO_SIZE: Readonly<Record<CompanionAvatarSize, number>> = {
  compact: 28,
  expanded: 40,
  welcome: 160,
};

/**
 * Companion artwork slot (Figma `Atlas/Refine/V3/Companion/Expressions` 141:2443). Shows the raster expression when
 * `art` is on and the Atlas symbol otherwise (roadmap R-9). Always decorative: the adjacent text carries the
 * message. Compact is a 48 px circle (141:2991); expanded (141:1751) and welcome (141:2891) are rounded squares.
 */
@Component({
  selector: 'atlas-companion-avatar',
  imports: [AtlasLogo],
  templateUrl: './companion-avatar.html',
  styleUrl: './companion-avatar.scss',
  host: {
    'aria-hidden': 'true',
    '[class.is-compact]': 'size() === "compact"',
    '[class.is-expanded]': 'size() === "expanded"',
    '[class.is-welcome]': 'size() === "welcome"',
    '[class.has-art]': 'art()',
    '[attr.data-expression]': 'expression()',
  },
})
export class AtlasCompanionAvatar {
  readonly expression = input.required<CompanionExpression>();
  readonly size = input<CompanionAvatarSize>('compact');
  /** Real raster art; off shows the Atlas symbol placeholder. */
  readonly art = input(false);

  protected readonly src = computed(() => COMPANION_ART[this.expression()].src);
  protected readonly logoSize = computed(() => LOGO_SIZE[this.size()]);
}
