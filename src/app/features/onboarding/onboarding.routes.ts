import type { Routes } from '@angular/router';
import { OnboardingFlow } from './data-access/onboarding-flow';

/** `/welcome` and `/welcome/setup` (F3-4), outside the app shell. */
export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    providers: [OnboardingFlow],
    children: [
      {
        path: '',
        title: 'Welcome',
        loadComponent: () => import('./welcome-page').then((m) => m.WelcomePage),
      },
      {
        path: 'setup',
        title: 'Getting started',
        loadComponent: () => import('./setup-page').then((m) => m.SetupPage),
      },
    ],
  },
];
