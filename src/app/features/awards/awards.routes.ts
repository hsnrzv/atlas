import type { Routes } from '@angular/router';
import { AWARDS } from '../../core/layout/navigation';
import { AwardsStore } from './data-access/awards.store';
import { AwardsPage } from './awards-page';

export const AWARDS_ROUTES: Routes = [
  {
    path: '',
    title: AWARDS.label,
    providers: [AwardsStore],
    component: AwardsPage,
  },
];
