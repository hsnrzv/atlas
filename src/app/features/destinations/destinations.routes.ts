import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { DESTINATIONS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';
import { DestinationsStore } from './data-access/destinations.store';
import { DestinationsPage } from './destinations-page';
import { DestinationDetailPage } from './destination-detail-page';

export const DESTINATIONS_ROUTES: Routes = [
  {
    path: '',
    title: DESTINATIONS.label,
    providers: [DestinationsStore],
    component: DestinationsPage,
  },
  {
    path: ':goalId',
    title: 'Destination',
    providers: [GoalPlanStore, PlanEditor],
    component: DestinationDetailPage,
  },
];
