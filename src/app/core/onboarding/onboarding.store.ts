import { inject, Injectable, signal } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import type { Onboarding, OnboardingAreas } from '../models/onboarding';
import { MY_ATLAS, WELCOME } from '../layout/navigation';
import { writeErrorMessage } from '../data-access/data-error';
import { OnboardingRepository } from '../data-access/ports/onboarding.repository';

/**
 * Onboarding state (F3-4, API-CONTRACT §9.3), shared by the start guard, the Welcome and setup pages and Settings.
 * Writes resolve to `null` when saved, else to the message to show.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingStore {
  private readonly repository = inject(OnboardingRepository);

  readonly onboarding = signal<Onboarding | null>(null);

  /** Reads the state; `null` when it cannot be read, so callers fall back to My Atlas. */
  async load(): Promise<Onboarding | null> {
    try {
      const value = await firstValueFrom(this.repository.onboarding());
      this.onboarding.set(value);
      return value;
    } catch {
      return null;
    }
  }

  saveAreas(areas: OnboardingAreas | null): Promise<string | null> {
    return this.write(this.repository.saveAreas(areas));
  }

  complete(): Promise<string | null> {
    return this.write(this.repository.complete());
  }

  reopen(): Promise<string | null> {
    return this.write(this.repository.reopen());
  }

  private async write(request: Observable<Onboarding>): Promise<string | null> {
    try {
      this.onboarding.set(await firstValueFrom(request));
      return null;
    } catch (error) {
      return writeErrorMessage(error);
    }
  }
}

/** `/`: Welcome until onboarding is completed, else My Atlas. An unreadable state never blocks the app. */
export const startGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const onboarding = await inject(OnboardingStore).load();
  return router.parseUrl(
    onboarding && onboarding.status !== 'COMPLETED' ? WELCOME.path : MY_ATLAS.path,
  );
};
