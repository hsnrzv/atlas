import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AtlasDataError } from '../../core/data-access/data-error';
import { OnboardingRepository } from '../../core/data-access/ports/onboarding.repository';
import { ATLAS_THEME_STORAGE_KEY } from '../../core/theme/atlas-theme';
import { SettingsPage } from './settings-page';

async function render(reopen: OnboardingRepository['reopen']) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: OnboardingRepository, useValue: { reopen } }],
  });
  const fixture = TestBed.createComponent(SettingsPage);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('SettingsPage', () => {
  afterEach(() => localStorage.clear());

  it('shows appearance, companion and setup sections', async () => {
    const { root } = await render(() => of());
    expect([...root.querySelectorAll('h2')].map((h) => h.textContent?.trim())).toEqual([
      'Appearance',
      'Companion',
      'Getting started',
    ]);
    expect(root.querySelector('a[href="/settings/companion"]')?.textContent).toContain(
      'Companion preferences',
    );
  });

  it('stores an explicit theme choice', async () => {
    const { fixture, root } = await render(() => of());
    root.querySelectorAll<HTMLInputElement>('mat-radio-button input')[2].click();
    await fixture.whenStable();
    expect(localStorage.getItem(ATLAS_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('reopens setup and goes to it', async () => {
    const { fixture, root } = await render(() =>
      of({ status: 'IN_PROGRESS', steps: [], completedAt: null }),
    );
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Run setup'))!.click();
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith('/welcome/setup');
  });

  it('keeps a failed reopen on screen', async () => {
    const { fixture, root } = await render(() =>
      throwError(() => new AtlasDataError('x', 'unavailable')),
    );
    [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Run setup'))!.click();
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'The Atlas service is not connected yet.',
    );
  });
});
