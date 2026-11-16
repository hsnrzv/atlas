import type { Routes } from '@angular/router';
import { SETTINGS } from '../../core/layout/navigation';

/** `/settings` and `/settings/companion` (P-C1, F3-4 "Run setup again"). */
export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: SETTINGS.label,
    loadComponent: () => import('./settings-page').then((m) => m.SettingsPage),
  },
  {
    path: 'companion',
    title: 'Companion',
    loadComponent: () => import('./companion-settings-page').then((m) => m.CompanionSettingsPage),
  },
];
