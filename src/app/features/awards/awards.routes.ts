import type { Routes } from '@angular/router';
import { AWARDS } from '../../core/layout/navigation';
import { AwardsStore } from './data-access/awards.store';

export const AWARDS_ROUTES: Routes = [
  {
    path: '',
    title: AWARDS.label,
    providers: [AwardsStore],
    loadComponent: () => import('./awards-page').then((m) => m.AwardsPage),
  },
];
