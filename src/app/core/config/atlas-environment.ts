import { InjectionToken } from '@angular/core';

/**
 * Build-time flags. They only separate the development server from the production build; every deployed
 * environment runs the same production image (PLAN-FRONTEND D4), so nothing here is environment-specific.
 */
export interface AtlasEnvironment {
  /** Repository adapter selected by `provideAtlasData()` (F2-2). The mock adapter never ships in production. */
  readonly dataSource: 'mock' | 'http';
  /** Dev-only tooling such as the `/_design` route and the sample-data actions. */
  readonly devTools: boolean;
  /** Companion art slot; stays off until the art rights are cleared (roadmap R-9). */
  readonly companionArt: boolean;
  /**
   * Signed-in client (F4-5): `/me` bootstrap and the 401 → sign-in redirect. Stays off until the backend's BFF login
   * (atlas-microservices ADR-0005) is live; with it off, a 401 only shows the "sign in again" message.
   */
  readonly auth: boolean;
}

export const ATLAS_ENVIRONMENT = new InjectionToken<AtlasEnvironment>('ATLAS_ENVIRONMENT');
