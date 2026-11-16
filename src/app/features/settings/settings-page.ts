import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router';
import { COMPANION_MODE_COPY } from '../../core/companion/companion-copy';
import { CompanionPreferencesStore } from '../../core/companion/companion-preferences.store';
import { WELCOME } from '../../core/layout/navigation';
import { OnboardingStore } from '../../core/onboarding/onboarding.store';
import { AtlasTheme, type AtlasThemePreference } from '../../core/theme/atlas-theme';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';

/** Settings: theme, companion and "Run setup again". Not drawn in Figma V3; built from the page 14 parts. */
@Component({
  selector: 'atlas-settings-page',
  imports: [
    AtlasIcon,
    AtlasPageHeader,
    AtlasPlanAlert,
    MatButton,
    MatRadioButton,
    MatRadioGroup,
    RouterLink,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly router = inject(Router);
  private readonly onboarding = inject(OnboardingStore);
  protected readonly theme = inject(AtlasTheme);
  protected readonly companion = inject(CompanionPreferencesStore);
  protected readonly modeCopy = COMPANION_MODE_COPY;
  protected readonly themes: readonly { value: AtlasThemePreference; label: string }[] = [
    { value: 'system', label: 'Match device' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  protected readonly reopening = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async runSetupAgain(): Promise<void> {
    this.reopening.set(true);
    const error = await this.onboarding.reopen();
    this.reopening.set(false);
    this.error.set(error);
    if (!error) {
      await this.router.navigateByUrl(WELCOME.setup);
    }
  }
}
