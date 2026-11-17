import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AtlasApi } from './atlas-api';
import { provideAtlasHttp } from './provide-atlas-http';

describe('AtlasApi', () => {
  let api: AtlasApi;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAtlasHttp(), provideHttpClientTesting()] });
    api = TestBed.inject(AtlasApi);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('encodes path segments so an id cannot change the path', () => {
    expect(api.url('goals', '../admin', 'a b')).toBe('/api/v1/goals/..%2Fadmin/a%20b');
  });

  it('reads every page of a collection', async () => {
    const all = firstValueFrom(api.getAll<number>(['goals'], { status: ['ACTIVE', 'PAUSED'] }));
    const first = backend.expectOne((request) => request.url === '/api/v1/goals');
    expect(first.request.urlWithParams).toBe(
      '/api/v1/goals?status=ACTIVE&status=PAUSED&page=0&size=100',
    );
    first.flush({
      content: [1, 2],
      page: { size: 100, number: 0, totalElements: 3, totalPages: 2 },
    });
    const second = backend.expectOne((request) => request.params.get('page') === '1');
    second.flush({ content: [3], page: { size: 100, number: 1, totalElements: 3, totalPages: 2 } });
    await expect(all).resolves.toEqual([1, 2, 3]);
  });

  it('accepts an unpaginated array', async () => {
    const all = firstValueFrom(api.getAll<number>(['goals', 'g', 'dependencies']));
    backend.expectOne((request) => request.url === '/api/v1/goals/g/dependencies').flush([7]);
    await expect(all).resolves.toEqual([7]);
  });

  it('sends the version as a strong ETag and the idempotency key', () => {
    void firstValueFrom(api.post(['goals'], { title: 'x' }, { version: 3, idempotencyKey: 'k-1' }));
    const request = backend.expectOne('/api/v1/goals').request;
    expect(request.headers.get('If-Match')).toBe('"3"');
    expect(request.headers.get('Idempotency-Key')).toBe('k-1');
  });

  it('skips empty query values and answers deletes with nothing', async () => {
    const done = firstValueFrom(
      api.delete(['goals', 'g'], { version: 0, query: { cascade: undefined } }),
    );
    const request = backend.expectOne('/api/v1/goals/g');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('If-Match')).toBe('"0"');
    expect(request.request.params.keys()).toEqual([]);
    request.flush(null, { status: 204, statusText: 'No Content' });
    await expect(done).resolves.toBeUndefined();
  });
});
