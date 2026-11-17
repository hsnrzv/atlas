import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { STEPS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';
import { StepsPage } from './steps-page';
import { StepDetailPage } from './step-detail-page';

/** `/steps?destination=&waypoint=&status=&due=` */
export const STEPS_ROUTES: Routes = [
  {
    path: '',
    title: STEPS.label,
    providers: [GoalPlanStore, PlanEditor],
    component: StepsPage,
  },
];

/** `/destinations/:goalId/steps/:nodeId` */
export const STEP_DETAIL_ROUTES: Routes = [
  {
    path: ':nodeId',
    title: 'Step',
    providers: [GoalPlanStore, PlanEditor],
    component: StepDetailPage,
  },
];
