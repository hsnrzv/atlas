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
}

export const ATLAS_ENVIRONMENT = new InjectionToken<AtlasEnvironment>('ATLAS_ENVIRONMENT');
