import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ATLAS_ENVIRONMENT, AtlasEnvironment } from '../../config/atlas-environment';
import { AtlasDataError } from '../data-error';
import { provideAtlasHttp } from '../http/provide-atlas-http';
import { AUTH_REDIRECT, AtlasSession } from './atlas-session';

function setup(auth: boolean) {
  const redirect = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      provideAtlasHttp(),
      provideHttpClientTesting(),
      { provide: AUTH_REDIRECT, useValue: redirect },
      {
        provide: ATLAS_ENVIRONMENT,
        useValue: {
          dataSource: 'http',
          devTools: false,
          companionArt: false,
          auth,
        } satisfies AtlasEnvironment,
      },
    ],
  });
  return {
    redirect,
    session: TestBed.inject(AtlasSession),
    http: TestBed.inject(HttpClient),
    backend: TestBed.inject(HttpTestingController),
  };
}

describe('AtlasSession (F4-5)', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('does nothing while the auth flag is off, and a 401 only reaches the caller', async () => {
    const { session, http, backend, redirect } = setup(false);
    await session.bootstrap();
    backend.expectNone('/api/v1/me');
    expect(session.status()).toBe('disabled');

    const read = firstValueFrom(http.get('/api/v1/dashboard'));
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(read).rejects.toMatchObject({ reason: 'unauthorized' });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('loads /me and reports the signed-in user', async () => {
    const { session, backend } = setup(true);
    expect(session.status()).toBe('unknown');
    const done = session.bootstrap();
    backend.expectOne('/api/v1/me').flush({ displayName: 'Mara' });
    await done;
    expect(session.signedIn()).toBe(true);
    expect(session.user()).toEqual({ displayName: 'Mara' });
  });

  it('sends the browser to sign in once when /me or any API call answers 401', async () => {
    const { session, http, backend, redirect } = setup(true);
    const done = session.bootstrap();
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    await done;
    expect(session.status()).toBe('signed-out');
    expect(redirect).toHaveBeenCalledExactlyOnceWith('/api/auth/login');

    const read = firstValueFrom(http.get('/api/v1/dashboard'));
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(read).rejects.toBeInstanceOf(AtlasDataError);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('leaves a 403 and other failures to the error message', async () => {
    const { session, http, backend, redirect } = setup(true);
    const read = firstValueFrom(http.get('/api/v1/dashboard'));
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 403, statusText: 'Forbidden' });
    await expect(read).rejects.toMatchObject({ reason: 'unauthorized' });

    const done = session.bootstrap();
    backend.expectOne('/api/v1/me').flush(null, { status: 400, statusText: 'Bad Request' });
    await done;
    expect(session.status()).toBe('unknown');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('ignores requests outside the API', async () => {
    const { http, backend, redirect } = setup(true);
    const read = firstValueFrom(http.get('/assets/x.json'));
    backend.expectOne('/assets/x.json').flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(read).rejects.toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('XSRF configuration (F4-5)', () => {
  it('sends the XSRF-TOKEN cookie back as X-XSRF-TOKEN on same-origin writes', async () => {
    const { http, backend } = setup(false);
    document.cookie = 'XSRF-TOKEN=t-123; path=/';
    try {
      const write = firstValueFrom(http.post('/api/v1/goals', {}));
      const request = backend.expectOne('/api/v1/goals');
      expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('t-123');
      request.flush({});
      await write;
    } finally {
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
  });
});
