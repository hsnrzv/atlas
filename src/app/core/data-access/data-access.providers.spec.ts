import { TestBed } from '@angular/core/testing';
import { ATLAS_ENVIRONMENT, AtlasEnvironment } from '../config/atlas-environment';
import { provideAtlasData } from './data-access.providers';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { MockDashboardRepository } from './mock/mock-dashboard.repository';
import { HttpGoalRepository } from './http/http-goal.repository';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ATLAS_SAMPLE_DATA } from './sample-data';

function setup(dataSource: AtlasEnvironment['dataSource']) {
  TestBed.configureTestingModule({
    providers: [
      provideAtlasData(),
      provideHttpClientTesting(),
      {
        provide: ATLAS_ENVIRONMENT,
        useValue: {
          dataSource,
          devTools: true,
          companionArt: false,
          auth: false,
        } satisfies AtlasEnvironment,
      },
    ],
  });
}

// Unit tests build with the development configuration, so `data-source.ts` is the development variant here.
describe('provideAtlasData (development build)', () => {
  it('uses the mock when the environment asks for it', () => {
    setup('mock');
    expect(TestBed.inject(DashboardRepository)).toBeInstanceOf(MockDashboardRepository);
    expect(TestBed.inject(ATLAS_SAMPLE_DATA)).toBe(true);
  });

  it('uses the HTTP adapters otherwise, through the Atlas interceptor', async () => {
    setup('http');
    const goals = TestBed.inject(GoalRepository);
    expect(goals).toBeInstanceOf(HttpGoalRepository);
    expect(TestBed.inject(ATLAS_SAMPLE_DATA)).toBe(false);
    const result = firstValueFrom(goals.get('g-1'));
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/goals/g-1');
    expect(request.request.headers.get('Accept')).toContain('application/json');
    request.flush({ code: 'RESOURCE_NOT_FOUND' }, { status: 404, statusText: 'Not Found' });
    await expect(result).rejects.toMatchObject({ reason: 'not-found', code: 'RESOURCE_NOT_FOUND' });
  });
});
