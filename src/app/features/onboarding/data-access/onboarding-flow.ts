import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ATLAS_SAMPLE_PLAN_LOADER } from '../../../core/data-access/sample-plan-loader';
import { MY_ATLAS } from '../../../core/layout/navigation';
import type { OnboardingAreas } from '../../../core/models/onboarding';
import { OnboardingStore } from '../../../core/onboarding/onboarding.store';

/**
 * Welcome and setup actions (F3-4, Figma flow A). Every path ends on My Atlas with onboarding completed; skipped
 * steps stay skipped and can be run again from Settings.
 */
@Injectable()
export class OnboardingFlow {
  private readonly store = inject(OnboardingStore);
  private readonly router = inject(Router);
  /** Dev-only "Explore sample plan"; `null` in production, where the action is not rendered. */
  private readonly sampleLoader = inject(ATLAS_SAMPLE_PLAN_LOADER);

  readonly canExploreSample = this.sampleLoader !== null;
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  /** "Continue": saves the chosen areas (none skips the step), then completes onboarding. */
  finish(areas: OnboardingAreas | null): Promise<void> {
    return this.run(async () => (await this.store.saveAreas(areas)) ?? this.store.complete());
  }

  /** "Skip for now": completes onboarding without saving anything. */
  skip(): Promise<void> {
    return this.run(() => this.store.complete());
  }

  exploreSample(): Promise<void> {
    return this.run(() => {
      this.sampleLoader?.();
      return this.store.complete();
    });
  }

  private async run(action: () => Promise<string | null>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const error = await action();
    this.busy.set(false);
    this.error.set(error);
    if (!error) {
      await this.router.navigateByUrl(MY_ATLAS.path);
    }
  }
}
