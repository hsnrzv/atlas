import type { Routes } from '@angular/router';
import { JOURNEY } from '../../core/layout/navigation';
import { JourneyStore } from './data-access/journey.store';
import { JourneyPage } from './journey-page';

export const JOURNEY_ROUTES: Routes = [
  {
    path: '',
    title: JOURNEY.label,
    providers: [JourneyStore],
    component: JourneyPage,
  },
];
