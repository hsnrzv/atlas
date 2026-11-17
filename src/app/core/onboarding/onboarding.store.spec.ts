import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AtlasDataError } from '../data-access/data-error';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  TEST_ADAPTERS,
  type MockMode,
} from '../data-access/testing/plan-testing';
import { OnboardingRepository } from '../data-access/ports/onboarding.repository';
import type { Onboarding } from '../models/onboarding';
import { OnboardingStore, startGuard } from './onboarding.store';

const state = (status: Onboarding['status']): Onboarding => ({
  status,
  steps: [{ key: 'areas', status: 'NOT_STARTED' }],
  completedAt: null,
});

function setup(repository: Partial<OnboardingRepository>) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: OnboardingRepository, useValue: repository }],
  });
  return TestBed.inject(OnboardingStore);
}

const guard = () =>
  TestBed.runInInjectionContext(() => startGuard({} as never, {} as never)) as Promise<UrlTree>;
const url = (tree: UrlTree) => TestBed.inject(Router).serializeUrl(tree);

describe('OnboardingStore', () => {
  it('sends a first visit to Welcome and a completed one to My Atlas', async () => {
    let status: Onboarding['status'] = 'NOT_STARTED';
    setup({ onboarding: () => of(state(status)) });
    expect(url(await guard())).toBe('/welcome');
    status = 'COMPLETED';
    expect(url(await guard())).toBe('/atlas');
  });

  it('falls back to My Atlas when the state cannot be read', async () => {
    const store = setup({ onboarding: () => throwError(() => new Error('offline')) });
    expect(url(await guard())).toBe('/atlas');
    expect(store.onboarding()).toBeNull();
  });

  it('keeps the latest state after a write and reports failures', async () => {
    const store = setup({
      complete: () => of(state('COMPLETED')),
      reopen: () => throwError(() => new AtlasDataError('Not allowed.', 'conflict')),
    });
    expect(await store.complete()).toBeNull();
    expect(store.onboarding()?.status).toBe('COMPLETED');
    expect(await store.reopen()).toBe('Not allowed.');
  });
});

describe.each(TEST_ADAPTERS)('OnboardingStore (%s adapter)', (adapter) => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function settle<T>(promise: Promise<T>): Promise<T> {
    for (let i = 0; i < 4; i++) {
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    return promise;
  }

  function setupWith(mode: MockMode) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), providePlanTesting(mode, adapter)],
    });
    return TestBed.inject(OnboardingStore);
  }

  it('walks a first visit through areas, completion and reopening', async () => {
    const store = setupWith('new');
    expect((await settle(store.load()))?.status).toBe('NOT_STARTED');
    expect(await settle(store.saveAreas({ areaKeys: ['LOVE'] }))).toBeNull();
    expect(store.onboarding()?.status).toBe('IN_PROGRESS');
    expect(store.onboarding()?.steps[0].status).toBe('COMPLETED');
    expect(await settle(store.complete())).toBeNull();
    expect(store.onboarding()?.status).toBe('COMPLETED');
    expect(await settle(store.reopen())).toBeNull();
    expect(store.onboarding()?.status).not.toBe('COMPLETED');
  });

  it('reports a failed write without changing the state', async () => {
    const store = setupWith('error');
    expect(await settle(store.load())).toBeNull();
    expect(await settle(store.complete())).toEqual(expect.any(String));
    expect(store.onboarding()).toBeNull();
  });
});
