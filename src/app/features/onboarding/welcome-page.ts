import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CompanionPreferencesStore } from '../../core/companion/companion-preferences.store';
import { WELCOME } from '../../core/layout/navigation';
import { AtlasLogo } from '../../shared/brand/atlas-logo';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { OnboardingFlow } from './data-access/onboarding-flow';

/**
 * Welcome (F3-4, Figma page 14 `230:63370`): start empty, skip, or (dev only) explore the sample plan. The companion
 * art slot shows the Atlas symbol until the art is cleared (roadmap R-9) and is hidden unless the companion is on.
 */
@Component({
  selector: 'atlas-welcome-page',
  imports: [AtlasIcon, AtlasLogo, AtlasPlanAlert, MatButton, RouterLink],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.scss',
})
export class WelcomePage {
  protected readonly flow = inject(OnboardingFlow);
  protected readonly companion = inject(CompanionPreferencesStore);
  protected readonly setupPath = WELCOME.setup;
}
