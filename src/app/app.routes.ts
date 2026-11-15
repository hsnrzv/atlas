import { inject } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { ATLAS_ENVIRONMENT } from './core/config/atlas-environment';
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
} from './core/layout/navigation';

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
  {
    path: '_design',
    title: 'Design foundation',
    canMatch: [() => inject(ATLAS_ENVIRONMENT).devTools],
    loadComponent: () =>
      import('./design-system/design-foundation').then((m) => m.DesignFoundation),
  },
  {
    path: '',
    component: AtlasAppShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: MY_ATLAS.path.slice(1) },
      placeholder(MY_ATLAS, 'Your Life Dimensions, active Destinations and next Waypoints.'),
      placeholder(DESTINATIONS, 'The long-term outcomes you are working towards.'),
      placeholder(WAYPOINTS, 'The milestones on the way to each Destination.'),
      placeholder(STEPS, 'The small actions that move a Waypoint forward.'),
      placeholder(CONNECTIONS, 'How your Destinations and Waypoints depend on each other.'),
      placeholder(JOURNEY, 'Your plan over time.'),
      placeholder(AWARDS, 'The rewards you set for reaching your milestones.'),
      placeholder(DIMENSIONS, 'The seven areas of your life and how they are doing.'),
      placeholder(SETTINGS, 'Preferences for your Atlas.'),
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
