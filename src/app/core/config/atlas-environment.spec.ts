import { TestBed } from '@angular/core/testing';
import { environment as development } from '../../../environments/environment.development';
import { appConfig } from '../../app.config';
import { ATLAS_ENVIRONMENT } from './atlas-environment';

// Unit tests build with the development configuration, so `environment.ts` resolves to the development file here.
// The production values are protected by the production build and, from F2-2, by the bundle guard.
describe('ATLAS_ENVIRONMENT', () => {
  it('is provided by the application config from the build environment', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    expect(TestBed.inject(ATLAS_ENVIRONMENT)).toEqual(development);
  });

  it('uses the mock adapter and dev tools in development builds, with companion art on and auth off', () => {
    expect(development).toEqual({
      dataSource: 'mock',
      devTools: true,
      companionArt: true,
      auth: false,
    });
  });
});
