import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { STEPS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';

/** `/steps?destination=&waypoint=&status=&due=` */
export const STEPS_ROUTES: Routes = [
  {
    path: '',
    title: STEPS.label,
    providers: [GoalPlanStore, PlanEditor],
    loadComponent: () => import('./steps-page').then((m) => m.StepsPage),
  },
];

/** `/destinations/:goalId/steps/:nodeId` */
export const STEP_DETAIL_ROUTES: Routes = [
  {
    path: ':nodeId',
    title: 'Step',
    providers: [GoalPlanStore, PlanEditor],
    loadComponent: () => import('./step-detail-page').then((m) => m.StepDetailPage),
  },
];
