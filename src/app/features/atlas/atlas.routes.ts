import type { Routes } from '@angular/router';
import { MY_ATLAS } from '../../core/layout/navigation';
import { AtlasOverviewStore } from './data-access/atlas-overview.store';
import { AtlasOverviewPage } from './atlas-overview-page';

export const ATLAS_ROUTES: Routes = [
  {
    path: '',
    title: MY_ATLAS.label,
    providers: [AtlasOverviewStore],
    component: AtlasOverviewPage,
  },
];
