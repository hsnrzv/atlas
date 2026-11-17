import type { Routes } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { WAYPOINTS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';
import { WaypointsPage } from './waypoints-page';
import { WaypointDetailPage } from './waypoint-detail-page';

/** `/waypoints?destination=` */
export const WAYPOINTS_ROUTES: Routes = [
  {
    path: '',
    title: WAYPOINTS.label,
    providers: [GoalPlanStore, PlanEditor],
    component: WaypointsPage,
  },
];

/** `/destinations/:goalId/waypoints/:nodeId`, at any depth of the tree. */
export const WAYPOINT_DETAIL_ROUTES: Routes = [
  {
    path: ':nodeId',
    title: 'Waypoint',
    providers: [GoalPlanStore, PlanEditor],
    component: WaypointDetailPage,
  },
];
