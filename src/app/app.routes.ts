import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Temporary root until the app shell lands (design step 4).
    path: '',
    title: 'Design foundation · IKIGAI ATLAS',
    loadComponent: () =>
      import('./design-system/design-foundation').then((m) => m.DesignFoundation),
  },
  { path: '**', redirectTo: '' },
];
