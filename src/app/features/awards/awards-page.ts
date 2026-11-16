import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CompanionPreferencesStore } from '../../core/companion/companion-preferences.store';
import { AWARDS, JOURNEY, MY_ATLAS } from '../../core/layout/navigation';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasCompanionCard } from '../../shared/ui/companion-card/companion-card';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { AwardsStore } from './data-access/awards.store';
import { toAwardsVm, type AwardCardVm } from './data-access/awards.view-model';

/**
 * Milestone Awards (P-V2, Figma page 11): the rewards the person planned, which ones the backend reports as earned,
 * achieved Waypoints and an optional, static companion celebration. No points, streaks or scores.
 */
@Component({
  selector: 'atlas-awards-page',
  imports: [
    AtlasCompanionCard,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasPageHeader,
    AtlasProgress,
    MatButton,
    RouterLink,
  ],
  templateUrl: './awards-page.html',
  styleUrl: './awards-page.scss',
})
export class AwardsPage {
  protected readonly title = AWARDS.label;
  protected readonly atlasLink = MY_ATLAS.path;
  protected readonly journeyLink = JOURNEY.path;
  protected readonly store = inject(AwardsStore);
  protected readonly companion = inject(CompanionPreferencesStore);
  private readonly toast = inject(AtlasToast);
  private readonly locale = inject(LOCALE_ID);

  protected readonly redeeming = signal<string | null>(null);
  protected readonly vm = computed(() => {
    const value = this.store.value();
    return value ? toAwardsVm(value, this.locale, this.store.sample) : null;
  });
  protected readonly companionMode = computed(() => {
    const mode = this.companion.mode();
    return mode !== 'off' && this.companion.shows('waypoint-achieved') ? mode : null;
  });

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.store.state);
  }

  protected async redeem(award: AwardCardVm): Promise<void> {
    this.redeeming.set(award.key);
    const error = await this.store.redeem(award.item);
    this.redeeming.set(null);
    this.toast.show(error ?? `${award.title} marked as celebrated`);
  }
}
