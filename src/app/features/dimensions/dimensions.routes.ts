import type { ResolveFn, Routes } from '@angular/router';
import { DIMENSIONS } from '../../core/layout/navigation';
import { LIFE_DIMENSIONS } from '../../shared/design-system/life-dimensions';
import { DimensionsStore } from './data-access/dimensions.store';

const dimensionTitle: ResolveFn<string> = (route) =>
  LIFE_DIMENSIONS.find((item) => item.key === route.paramMap.get('dimension'))?.label ??
  DIMENSIONS.label;

export const DIMENSIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [DimensionsStore],
    children: [
      {
        path: '',
        title: DIMENSIONS.label,
        loadComponent: () => import('./dimensions-page').then((m) => m.DimensionsPage),
      },
      {
        path: ':dimension',
        title: dimensionTitle,
        loadComponent: () => import('./dimension-detail-page').then((m) => m.DimensionDetailPage),
      },
    ],
  },
];
