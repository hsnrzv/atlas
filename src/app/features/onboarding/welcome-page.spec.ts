import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ATLAS_COMPANION_STORAGE_KEY } from '../../core/companion/companion-preferences.store';
import { ATLAS_SAMPLE_PLAN_LOADER } from '../../core/data-access/sample-plan-loader';
import { OnboardingStore } from '../../core/onboarding/onboarding.store';
import { OnboardingFlow } from './data-access/onboarding-flow';
import { WelcomePage } from './welcome-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('WelcomePage', () => {
  const store = { complete: vi.fn(), saveAreas: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    store.complete.mockReset().mockResolvedValue(null);
  });

  function render(loader: (() => void) | null = null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        OnboardingFlow,
        { provide: OnboardingStore, useValue: store },
        { provide: ATLAS_SAMPLE_PLAN_LOADER, useValue: loader },
      ],
    });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(WelcomePage);
    fixture.detectChanges();
    return { root: fixture.nativeElement as HTMLElement, fixture, navigate };
  }

  const button = (root: HTMLElement, label: string) =>
    Array.from(root.querySelectorAll<HTMLElement>('a, button')).find(
      (element) => text(element) === label,
    );

  it('starts setup or skips straight to My Atlas', async () => {
    const { root, navigate } = render();

    expect(text(root.querySelector('h1'))).toBe('Your life, mapped with purpose.');
    expect(button(root, 'Get started')?.getAttribute('href')).toBe('/welcome/setup');
    expect(button(root, 'Explore sample plan')).toBeUndefined();

    button(root, 'Skip for now')!.click();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/atlas'));
    expect(store.complete).toHaveBeenCalledOnce();
  });

  it('loads the sample plan in development builds', async () => {
    const loader = vi.fn();
    const { root, navigate } = render(loader);

    button(root, 'Explore sample plan')!.click();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/atlas'));
    expect(loader).toHaveBeenCalledOnce();
  });

  it('stays on Welcome and explains a failed save', async () => {
    store.complete.mockResolvedValue('Your change was not saved. Try again.');
    const { root, fixture, navigate } = render();

    button(root, 'Skip for now')!.click();
    await vi.waitFor(() => expect(store.complete).toHaveBeenCalled());
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text(root.querySelector('atlas-plan-alert'))).toContain('Your change was not saved.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('hides the companion art unless the companion is on', () => {
    localStorage.setItem(ATLAS_COMPANION_STORAGE_KEY, 'off');
    const { root } = render();

    expect(root.querySelector('.art')).toBeNull();
  });
});
