import { Component, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { COMPANION_COPY, type CompanionTrigger } from '../../../core/companion/companion-copy';
import type { CompanionMode } from '../../../core/companion/companion-preferences.store';
import { AtlasCompanionAvatar } from '../companion-avatar/companion-avatar';
import { AtlasIconButton } from '../icon-button/icon-button';

let nextId = 0;

/**
 * Optional companion (Figma Atlas/V3/CompanionCard 152:2755–152:2789, P-C1). Static copy from the catalogue,
 * Dismiss / Mute / Disable on every appearance, no audio and no analysis (frontend.md §9). The art slot shows the
 * trigger's companion expression (Figma 141:2443) when `art` is on and the Atlas symbol otherwise (R-9); muted cards
 * drop the slot and the entrance animation.
 * The primary action (for example "View waypoint") is projected with the `atlasCompanionAction` attribute.
 */
@Component({
  selector: 'atlas-companion-card',
  imports: [AtlasCompanionAvatar, AtlasIconButton, MatButton],
  templateUrl: './companion-card.html',
  styleUrl: './companion-card.scss',
  host: {
    role: 'region',
    '[attr.aria-labelledby]': 'titleId',
    '[class.is-muted]': 'mode() === "muted"',
    '[class.is-expanded]': 'variant() === "expanded"',
  },
})
export class AtlasCompanionCard {
  readonly trigger = input.required<CompanionTrigger>();
  /** `off` is handled by the page, which does not render the card. */
  readonly mode = input.required<Exclude<CompanionMode, 'off'>>();
  readonly variant = input<'compact' | 'expanded'>('compact');
  /** Optional sentence below the title; pages pass only facts the backend reported. */
  readonly body = input<string | null>(null);
  /** Show the real companion art; pages pass `CompanionPreferencesStore.art` (`companionArt` flag). */
  readonly art = input(false);

  readonly dismissed = output();
  readonly muted = output();
  readonly disabled = output();

  protected readonly titleId = `atlas-companion-${nextId++}`;
  protected readonly copy = computed(() => COMPANION_COPY[this.trigger()]);
}
