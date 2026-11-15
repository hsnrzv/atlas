import { InjectionToken } from '@angular/core';

/**
 * `true` while the app shows the development sample instead of a saved plan, so pages can label it
 * ("Sample plan · …", Figma page 05). Always `false` in production builds.
 */
export const ATLAS_SAMPLE_DATA = new InjectionToken<boolean>('ATLAS_SAMPLE_DATA', {
  providedIn: 'root',
  factory: () => false,
});
