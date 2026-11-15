import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { DESTINATIONS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';
import { DestinationsStore } from './data-access/destinations.store';

export const DESTINATIONS_ROUTES: Routes = [
  {
    path: '',
    title: DESTINATIONS.label,
    providers: [DestinationsStore],
    loadComponent: () => import('./destinations-page').then((m) => m.DestinationsPage),
  },
  {
    path: ':goalId',
    title: 'Destination',
    providers: [GoalPlanStore, PlanEditor],
    loadComponent: () => import('./destination-detail-page').then((m) => m.DestinationDetailPage),
  },
];
