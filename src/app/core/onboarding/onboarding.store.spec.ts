import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AtlasDataError } from '../data-access/data-error';
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
