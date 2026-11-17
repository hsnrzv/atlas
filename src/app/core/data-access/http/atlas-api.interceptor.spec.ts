import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AtlasDataError } from '../data-error';
import { ATLAS_HTTP_RETRY } from './api-config';
import { provideAtlasHttp } from './provide-atlas-http';

describe('atlasApiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideAtlasHttp(),
        provideHttpClientTesting(),
        { provide: ATLAS_HTTP_RETRY, useValue: { count: 2, delayMs: 100 } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    vi.useRealTimers();
  });

  it('asks the API for JSON and leaves other URLs alone', () => {
    void firstValueFrom(http.get('/api/v1/dashboard'));
    void firstValueFrom(http.get('/assets/i18n.json'));
    expect(backend.expectOne('/api/v1/dashboard').request.headers.get('Accept')).toBe(
      'application/json, application/problem+json',
    );
    expect(backend.expectOne('/assets/i18n.json').request.headers.has('Accept')).toBe(false);
  });

  it('retries a read after a transient failure, with backoff', async () => {
    const result = firstValueFrom(http.get('/api/v1/dashboard'));
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 503, statusText: 'Unavailable' });
    await vi.advanceTimersByTimeAsync(100);
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 0, statusText: '' });
    await vi.advanceTimersByTimeAsync(199);
    backend.expectNone('/api/v1/dashboard');
    await vi.advanceTimersByTimeAsync(1);
    backend.expectOne('/api/v1/dashboard').flush({ ok: true });
    await expect(result).resolves.toEqual({ ok: true });
  });

  it('gives up after the retry budget with a typed error', async () => {
    const result = firstValueFrom(http.get('/api/v1/dashboard'));
    const outcome = result.catch((error: unknown) => error);
    for (const wait of [100, 200]) {
      backend.expectOne('/api/v1/dashboard').flush(null, { status: 504, statusText: 'Timeout' });
      await vi.advanceTimersByTimeAsync(wait);
    }
    backend.expectOne('/api/v1/dashboard').flush(null, { status: 504, statusText: 'Timeout' });
    const error = await outcome;
    expect(error).toBeInstanceOf(AtlasDataError);
    expect(error).toMatchObject({ reason: 'unavailable' });
  });

  it('does not retry client errors or writes', async () => {
    const read = firstValueFrom(http.get('/api/v1/goals/x')).catch((error: unknown) => error);
    backend
      .expectOne('/api/v1/goals/x')
      .flush({ code: 'RESOURCE_NOT_FOUND' }, { status: 404, statusText: '' });
    expect(await read).toMatchObject({ reason: 'not-found' });

    const write = firstValueFrom(http.post('/api/v1/goals', {})).catch((error: unknown) => error);
    backend.expectOne('/api/v1/goals').flush(null, { status: 503, statusText: '' });
    await vi.advanceTimersByTimeAsync(1000);
    backend.expectNone('/api/v1/goals');
    expect(await write).toMatchObject({ reason: 'unavailable' });
  });
});
