import { Route, Routes } from '@angular/router';
import { AtlasAppShell } from './core/layout/app-shell/app-shell';
import {
  AWARDS,
  AtlasNavLink,
  CONNECTIONS,
  DESTINATIONS,
  DIMENSIONS,
  HELP,
  JOURNEY,
  MORE,
  MY_ATLAS,
  PROFILE,
  SETTINGS,
  STEPS,
  WAYPOINTS,
  WELCOME,
} from './core/layout/navigation';
import { startGuard } from './core/onboarding/onboarding.store';
import { devRoutes } from './dev-routes';

/** Temporary page for an area until its feature lands (F1-14); route data feeds the page inputs. */
function placeholder(link: AtlasNavLink, description: string): Route {
  return {
    path: link.path.slice(1),
    title: link.label,
    data: { heading: link.label, description },
    loadComponent: () =>
      import('./features/placeholder/area-placeholder-page').then((m) => m.AreaPlaceholderPage),
  };
}

export const routes: Routes = [
  ...devRoutes,
  {
    path: WELCOME.path.slice(1),
    loadChildren: () =>
      import('./features/onboarding/onboarding.routes').then((m) => m.ONBOARDING_ROUTES),
  },
  {
    path: '',
    component: AtlasAppShell,
    children: [
      { path: '', pathMatch: 'full', canActivate: [startGuard], children: [] },
      {
        path: MY_ATLAS.path.slice(1),
        loadChildren: () => import('./features/atlas/atlas.routes').then((m) => m.ATLAS_ROUTES),
      },
      {
        path: `${DESTINATIONS.path.slice(1)}/:goalId/waypoints`,
        loadChildren: () =>
          import('./features/waypoints/waypoints.routes').then((m) => m.WAYPOINT_DETAIL_ROUTES),
      },
      {
        path: `${DESTINATIONS.path.slice(1)}/:goalId/steps`,
        loadChildren: () =>
          import('./features/steps/steps.routes').then((m) => m.STEP_DETAIL_ROUTES),
      },
      {
        path: DESTINATIONS.path.slice(1),
        loadChildren: () =>
          import('./features/destinations/destinations.routes').then((m) => m.DESTINATIONS_ROUTES),
      },
      {
        path: WAYPOINTS.path.slice(1),
        loadChildren: () =>
          import('./features/waypoints/waypoints.routes').then((m) => m.WAYPOINTS_ROUTES),
      },
      {
        path: STEPS.path.slice(1),
        loadChildren: () => import('./features/steps/steps.routes').then((m) => m.STEPS_ROUTES),
      },
      {
        path: CONNECTIONS.path.slice(1),
        loadChildren: () =>
          import('./features/connections/connections.routes').then((m) => m.CONNECTIONS_ROUTES),
      },
      {
        path: JOURNEY.path.slice(1),
        loadChildren: () =>
          import('./features/journey/journey.routes').then((m) => m.JOURNEY_ROUTES),
      },
      {
        path: AWARDS.path.slice(1),
        loadChildren: () => import('./features/awards/awards.routes').then((m) => m.AWARDS_ROUTES),
      },
      {
        path: DIMENSIONS.path.slice(1),
        loadChildren: () =>
          import('./features/dimensions/dimensions.routes').then((m) => m.DIMENSIONS_ROUTES),
      },
      {
        path: SETTINGS.path.slice(1),
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      placeholder(PROFILE, 'Your account details.'),
      placeholder(HELP, 'Answers and guidance for using your Atlas.'),
      {
        path: MORE.path.slice(1),
        title: MORE.label,
        loadComponent: () => import('./features/more/more-page').then((m) => m.MorePage),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () =>
          import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
