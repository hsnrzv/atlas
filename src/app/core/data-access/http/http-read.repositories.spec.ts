import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { AwardItem } from '../../models/awards';
import {
  HttpAwardRepository,
  HttpConnectionRepository,
  HttpDashboardRepository,
  HttpOnboardingRepository,
  HttpTimelineRepository,
} from './http-read.repositories';
import { provideAtlasHttp } from './provide-atlas-http';

describe('HTTP read-model adapters', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAtlasHttp(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('reads the dashboard, connections and awards', () => {
    void firstValueFrom(TestBed.inject(HttpDashboardRepository).dashboard());
    void firstValueFrom(TestBed.inject(HttpConnectionRepository).connections());
    void firstValueFrom(TestBed.inject(HttpAwardRepository).awards());
    backend.expectOne('/api/v1/dashboard');
    backend.expectOne((r) => r.url === '/api/v1/connections');
    backend.expectOne('/api/v1/rewards');
  });

  it('passes the timeline range as query parameters', () => {
    void firstValueFrom(
      TestBed.inject(HttpTimelineRepository).timeline({ from: '2027-01-01', to: '2027-12-31' }),
    );
    expect(backend.expectOne((r) => r.url === '/api/v1/timeline').request.urlWithParams).toBe(
      '/api/v1/timeline?from=2027-01-01&to=2027-12-31',
    );
  });

  it('redeems a Waypoint reward with the node ETag and keeps the server state', async () => {
    const item = { goalId: 'g', nodeId: 'n', status: 'EARNED', redeemedAt: null } as AwardItem;
    const redeemed = firstValueFrom(TestBed.inject(HttpAwardRepository).redeem(item));
    backend.expectOne('/api/v1/goals/g/nodes/n').flush({ id: 'n', version: 4 });
    await Promise.resolve();
    const request = backend.expectOne('/api/v1/goals/g/nodes/n/reward/redeem');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('If-Match')).toBe('"4"');
    request.flush({
      description: 'Trip',
      status: 'REDEEMED',
      earnedAt: '2026-12-01T00:00:00Z',
      redeemedAt: '2027-01-01T00:00:00Z',
    });
    await expect(redeemed).resolves.toMatchObject({
      goalId: 'g',
      status: 'REDEEMED',
      earnedAt: '2026-12-01T00:00:00Z',
      redeemedAt: '2027-01-01T00:00:00Z',
    });
  });

  it('redeems a Destination reward with the goal ETag', async () => {
    const item = { goalId: 'g', nodeId: null, status: 'EARNED', redeemedAt: null } as AwardItem;
    const redeemed = firstValueFrom(TestBed.inject(HttpAwardRepository).redeem(item));
    backend.expectOne('/api/v1/goals/g').flush({ id: 'g', version: 7 });
    await Promise.resolve();
    const request = backend.expectOne('/api/v1/goals/g/reward/redeem');
    expect(request.request.headers.get('If-Match')).toBe('"7"');
    request.flush({ description: 'Trip', status: 'REDEEMED', redeemedAt: '2027-01-01T00:00:00Z' });
    await expect(redeemed).resolves.toMatchObject({ status: 'REDEEMED' });
  });

  it('saves or skips the areas step', () => {
    const onboarding = TestBed.inject(HttpOnboardingRepository);
    void firstValueFrom(onboarding.saveAreas({ areaKeys: ['CAREER'] }));
    expect(backend.expectOne('/api/v1/onboarding/steps/areas').request.body).toEqual({
      status: 'COMPLETED',
      payload: { areaKeys: ['CAREER'] },
    });
    void firstValueFrom(onboarding.saveAreas(null));
    expect(backend.expectOne('/api/v1/onboarding/steps/areas').request.body).toEqual({
      status: 'SKIPPED',
      payload: null,
    });
    void firstValueFrom(onboarding.complete());
    void firstValueFrom(onboarding.reopen());
    backend.expectOne('/api/v1/onboarding/complete');
    backend.expectOne('/api/v1/onboarding/reopen');
  });
});
