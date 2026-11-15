import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { WAYPOINTS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';

/** `/waypoints?destination=` */
export const WAYPOINTS_ROUTES: Routes = [
  {
    path: '',
    title: WAYPOINTS.label,
    providers: [GoalPlanStore, PlanEditor],
    loadComponent: () => import('./waypoints-page').then((m) => m.WaypointsPage),
  },
];

/** `/destinations/:goalId/waypoints/:nodeId`, at any depth of the tree. */
export const WAYPOINT_DETAIL_ROUTES: Routes = [
  {
    path: ':nodeId',
    title: 'Waypoint',
    providers: [GoalPlanStore, PlanEditor],
    loadComponent: () => import('./waypoint-detail-page').then((m) => m.WaypointDetailPage),
  },
];
