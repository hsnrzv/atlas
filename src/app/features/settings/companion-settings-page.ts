import { Component, inject } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { COMPANION_MODE_COPY } from '../../core/companion/companion-copy';
import {
  CompanionPreferencesStore,
  type CompanionMode,
} from '../../core/companion/companion-preferences.store';
import { SETTINGS } from '../../core/layout/navigation';
import { AtlasBreadcrumbs } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';

/** "Your companion, your choice" (Figma page 14, 230:74295 / 230:74299 / 230:74303), saved on change. */
@Component({
  selector: 'atlas-companion-settings-page',
  imports: [AtlasBreadcrumbs, AtlasPageHeader, MatRadioButton, MatRadioGroup],
  templateUrl: './companion-settings-page.html',
  styleUrl: './companion-settings-page.scss',
})
export class CompanionSettingsPage {
  protected readonly store = inject(CompanionPreferencesStore);
  protected readonly copy = COMPANION_MODE_COPY;
  protected readonly modes: readonly CompanionMode[] = ['on', 'muted', 'off'];
  protected readonly breadcrumbs = [
    { label: SETTINGS.label, path: SETTINGS.path },
    { label: 'Companion' },
  ];
}
