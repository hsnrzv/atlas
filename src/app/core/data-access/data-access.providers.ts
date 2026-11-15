import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { dataSourceProviders } from './data-source';

/** Registers the repository ports with the adapter of this build (frontend.md §6.2). */
export function provideAtlasData(): EnvironmentProviders {
  return makeEnvironmentProviders(dataSourceProviders());
}
