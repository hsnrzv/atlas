import type { Routes } from '@angular/router';
import { CONNECTIONS } from '../../core/layout/navigation';
import { ConnectionsStore } from './data-access/connections.store';
import { ConnectionsPage } from './connections-page';

export const CONNECTIONS_ROUTES: Routes = [
  {
    path: '',
    title: CONNECTIONS.label,
    providers: [ConnectionsStore],
    component: ConnectionsPage,
  },
];
