import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { ATLAS_ENVIRONMENT } from './core/config/atlas-environment';

/** Development routes (replaces `dev-routes.ts` in development builds). */
export const devRoutes: Routes = [
  {
    path: '_design',
    title: 'Design foundation',
    canMatch: [() => inject(ATLAS_ENVIRONMENT).devTools],
    loadComponent: () =>
      import('./design-system/design-foundation').then((m) => m.DesignFoundation),
  },
];
