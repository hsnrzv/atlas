import { TestBed } from '@angular/core/testing';
import { ATLAS_ENVIRONMENT, AtlasEnvironment } from '../config/atlas-environment';
import { provideAtlasData } from './data-access.providers';
import { DashboardRepository } from './ports/dashboard.repository';
import { GoalRepository } from './ports/goal.repository';
import { MockDashboardRepository } from './mock/mock-dashboard.repository';
import { UnavailableGoalRepository } from './unavailable/unavailable.repositories';
import { firstValueFrom } from 'rxjs';
import { ATLAS_SAMPLE_DATA } from './sample-data';

function setup(dataSource: AtlasEnvironment['dataSource']) {
  TestBed.configureTestingModule({
    providers: [
      provideAtlasData(),
      {
        provide: ATLAS_ENVIRONMENT,
        useValue: { dataSource, devTools: true, companionArt: false } satisfies AtlasEnvironment,
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

  it('falls back to the unavailable adapters otherwise', async () => {
    setup('http');
    const goals = TestBed.inject(GoalRepository);
    expect(goals).toBeInstanceOf(UnavailableGoalRepository);
    expect(TestBed.inject(ATLAS_SAMPLE_DATA)).toBe(false);
    await expect(firstValueFrom(goals.list())).rejects.toMatchObject({ reason: 'unavailable' });
  });
});
