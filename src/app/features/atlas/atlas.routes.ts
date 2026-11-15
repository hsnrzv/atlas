import type { Routes } from '@angular/router';
import { MY_ATLAS } from '../../core/layout/navigation';
import { AtlasOverviewStore } from './data-access/atlas-overview.store';

export const ATLAS_ROUTES: Routes = [
  {
    path: '',
    title: MY_ATLAS.label,
    providers: [AtlasOverviewStore],
    loadComponent: () => import('./atlas-overview-page').then((m) => m.AtlasOverviewPage),
  },
];
