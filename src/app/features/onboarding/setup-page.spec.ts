import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ATLAS_SAMPLE_PLAN_LOADER } from '../../core/data-access/sample-plan-loader';
import { OnboardingStore } from '../../core/onboarding/onboarding.store';
import { OnboardingFlow } from './data-access/onboarding-flow';
import { SetupPage } from './setup-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('SetupPage', () => {
  const store = { complete: vi.fn(), saveAreas: vi.fn() };

  beforeEach(() => {
    store.complete.mockReset().mockResolvedValue(null);
    store.saveAreas.mockReset().mockResolvedValue(null);
  });

  function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        OnboardingFlow,
        { provide: OnboardingStore, useValue: store },
        { provide: ATLAS_SAMPLE_PLAN_LOADER, useValue: null },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SetupPage);
    fixture.detectChanges();
    return { root: fixture.nativeElement as HTMLElement, fixture, navigate };
  }

  const button = (root: HTMLElement, label: string) =>
    Array.from(root.querySelectorAll<HTMLElement>('a, button')).find(
      (element) => text(element) === label,
    );

  it('offers the seven dimensions and asks for nothing sensitive', () => {
    const { root } = render();

    expect(text(root.querySelector('h1'))).toBe('A little direction. Your pace.');
    expect(Array.from(root.querySelectorAll('mat-chip-option'), text)).toEqual([
      'Career',
      'Finance',
      'Health',
      'Love',
      'Passion',
      'Friendship',
      'Family',
    ]);
    expect(text(root)).toContain('No financial or health details required.');
    expect(button(root, 'Companion preferences')?.getAttribute('href')).toBe('/settings/companion');
  });

  it('saves the chosen areas and completes onboarding', async () => {
    const { root, fixture, navigate } = render();

    root
      .querySelectorAll<HTMLElement>('mat-chip-option [role="option"], .mat-mdc-chip-action')[0]
      .click();
    fixture.detectChanges();
    button(root, 'Continue')!.click();

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/atlas'));
    expect(store.saveAreas).toHaveBeenCalledWith({ areaKeys: ['CAREER'] });
    expect(store.complete).toHaveBeenCalledOnce();
  });

  it('skips the areas step when nothing is chosen', async () => {
    const { root, navigate } = render();

    button(root, 'Continue')!.click();

    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(store.saveAreas).toHaveBeenCalledWith(null);
  });
});
