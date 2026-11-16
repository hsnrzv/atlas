import type { Routes } from '@angular/router';
import { JOURNEY } from '../../core/layout/navigation';
import { JourneyStore } from './data-access/journey.store';

export const JOURNEY_ROUTES: Routes = [
  {
    path: '',
    title: JOURNEY.label,
    providers: [JourneyStore],
    loadComponent: () => import('./journey-page').then((m) => m.JourneyPage),
  },
];
