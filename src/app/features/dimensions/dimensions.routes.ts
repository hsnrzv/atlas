import type { ResolveFn, Routes } from '@angular/router';
import { DIMENSIONS } from '../../core/layout/navigation';
import { LIFE_DIMENSIONS } from '../../shared/design-system/life-dimensions';
import { DimensionsStore } from './data-access/dimensions.store';
import { DimensionsPage } from './dimensions-page';
import { DimensionDetailPage } from './dimension-detail-page';

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
        component: DimensionsPage,
      },
      {
        path: ':dimension',
        title: dimensionTitle,
        component: DimensionDetailPage,
      },
    ],
  },
];
