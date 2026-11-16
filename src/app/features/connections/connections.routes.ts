import type { Routes } from '@angular/router';
import { CONNECTIONS } from '../../core/layout/navigation';
import { ConnectionsStore } from './data-access/connections.store';

export const CONNECTIONS_ROUTES: Routes = [
  {
    path: '',
    title: CONNECTIONS.label,
    providers: [ConnectionsStore],
    loadComponent: () => import('./connections-page').then((m) => m.ConnectionsPage),
  },
];
