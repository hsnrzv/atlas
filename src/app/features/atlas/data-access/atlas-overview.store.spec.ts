import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReplaySubject, type Observable } from 'rxjs';
import { AtlasDataError } from '../../../core/data-access/data-error';
import { DashboardRepository } from '../../../core/data-access/ports/dashboard.repository';
import type { Dashboard } from '../../../core/models/dashboard';
import { emptyDashboard, testDashboard } from '../testing/dashboard.fixture';
import { AtlasOverviewStore } from './atlas-overview.store';

/** Each `dashboard()` call returns a new pending request that the test answers. */
class FakeDashboardRepository extends DashboardRepository {
  readonly requests: ReplaySubject<Dashboard>[] = [];

  dashboard(): Observable<Dashboard> {
    const request = new ReplaySubject<Dashboard>(1);
    this.requests.push(request);
    return request;
  }

  answer(dashboard: Dashboard): void {
    const request = this.requests.at(-1)!;
    request.next(dashboard);
    request.complete();
  }

  fail(): void {
    this.requests.at(-1)!.error(new AtlasDataError('offline', 'network'));
  }
}

async function setup() {
  const repository = new FakeDashboardRepository();
  TestBed.configureTestingModule({
    providers: [
      AtlasOverviewStore,
      { provide: DashboardRepository, useValue: repository },
      { provide: LOCALE_ID, useValue: 'en-US' },
    ],
  });
  const store = TestBed.inject(AtlasOverviewStore);
  const settle = async () => {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  };
  store.enter();
  await settle();
  return { store, repository, settle };
}

describe('AtlasOverviewStore', () => {
  it('loads the dashboard and maps it for the page', async () => {
    const { store, repository, settle } = await setup();
    expect(store.state()).toBe('loading');
    expect(repository.requests).toHaveLength(1);

    repository.answer(testDashboard());
    await settle();

    expect(store.state()).toBe('ready');
    expect(store.overview()?.destination.title).toBe('Run a marathon');
    expect(store.overview()?.sample).toBe(false);
    expect(store.refreshing()).toBe(false);
  });

  it('shows the Empty state when there is no active Destination', async () => {
    const { store, repository, settle } = await setup();
    repository.answer(emptyDashboard());
    await settle();

    expect(store.state()).toBe('empty');
    expect(store.overview()).toBeNull();
  });

  it('shows the Error state and retries', async () => {
    const { store, repository, settle } = await setup();
    repository.fail();
    await settle();
    expect(store.state()).toBe('error');
    expect(store.overview()).toBeNull();

    store.retry();
    await settle();
    expect(repository.requests).toHaveLength(2);
    repository.answer(testDashboard());
    await settle();
    expect(store.state()).toBe('ready');
  });

  it('refreshes on a revisit and keeps the last saved plan when that fails', async () => {
    const { store, repository, settle } = await setup();
    repository.answer(testDashboard());
    await settle();

    store.enter();
    await settle();
    expect(repository.requests).toHaveLength(2);
    expect(store.state()).toBe('ready');
    expect(store.refreshing()).toBe(true);

    repository.fail();
    await settle();
    expect(store.state()).toBe('error');
    expect(store.overview()?.savedLines[0]).toBe('30% · 3 of 10 Steps complete');
  });
});
