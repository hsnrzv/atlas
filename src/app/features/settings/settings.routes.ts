import type { Routes } from '@angular/router';
import { SETTINGS } from '../../core/layout/navigation';
import { SettingsPage } from './settings-page';
import { CompanionSettingsPage } from './companion-settings-page';

/** `/settings` and `/settings/companion` (P-C1, F3-4 "Run setup again"). */
export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: SETTINGS.label,
    component: SettingsPage,
  },
  {
    path: 'companion',
    title: 'Companion',
    component: CompanionSettingsPage,
  },
];
