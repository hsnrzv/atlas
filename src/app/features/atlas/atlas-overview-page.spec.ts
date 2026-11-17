import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of, ReplaySubject, throwError, type Observable } from 'rxjs';
import { ATLAS_COMPANION_STORAGE_KEY } from '../../core/companion/companion-preferences.store';
import { AtlasDataError } from '../../core/data-access/data-error';
import { DashboardRepository } from '../../core/data-access/ports/dashboard.repository';
import { ATLAS_SAMPLE_DATA } from '../../core/data-access/sample-data';
import type { Dashboard } from '../../core/models/dashboard';
import { AtlasOverviewPage } from './atlas-overview-page';
import { AtlasOverviewStore } from './data-access/atlas-overview.store';
import { emptyDashboard, testDashboard } from './testing/dashboard.fixture';

/** Answers each request with the next response; the last one repeats. */
class ScriptedDashboardRepository extends DashboardRepository {
  constructor(private readonly responses: (() => Observable<Dashboard>)[]) {
    super();
  }

  dashboard(): Observable<Dashboard> {
    return (this.responses.length > 1 ? this.responses.shift()! : this.responses[0])();
  }
}

const offline = () => throwError(() => new AtlasDataError('offline', 'network'));

async function render(responses: (() => Observable<Dashboard>)[], sample = false, settle = true) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      AtlasOverviewStore,
      { provide: DashboardRepository, useValue: new ScriptedDashboardRepository(responses) },
      { provide: ATLAS_SAMPLE_DATA, useValue: sample },
      { provide: LOCALE_ID, useValue: 'en-US' },
    ],
  });
  const fixture = TestBed.createComponent(AtlasOverviewPage);
  if (settle) {
    await fixture.whenStable();
  } else {
    fixture.detectChanges();
  }
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('AtlasOverviewPage', () => {
  it('shows the Loading state while the plan loads', async () => {
    const { root } = await render([() => NEVER], false, false);

    expect(text(root.querySelector('h1'))).toBe('Opening your Atlas.');
    expect(root.querySelector('[role="status"]')?.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('.skeleton-panels')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the Empty state with a way to create a Destination', async () => {
    const { root } = await render([() => of(emptyDashboard())]);

    expect(text(root.querySelector('h1'))).toBe('Your next chapter.');
    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Destinations yet');
    expect(root.querySelector('atlas-feedback-state a')?.getAttribute('href')).toBe(
      '/destinations',
    );
    expect(text(root.querySelector('#atlas-starting-point'))).toBe('Your starting point');
  });

  it('shows the Overview with every section in heading order', async () => {
    localStorage.clear();
    const { root } = await render([() => of(testDashboard())], true);
    const headings = Array.from(
      root.querySelectorAll('h1, h2, h3'),
      (h) => `${h.tagName} ${text(h)}`,
    );

    expect(headings).toEqual([
      'H1 Your next chapter.',
      'H2 Build the life you envision.',
      'H2 Run a marathon',
      'H3 Finish a half marathon',
      'H2 Choose one meaningful next step.',
      'H2 At a glance',
      'H2 Life dimensions',
      'H3 Health',
      'H3 Finance',
      'H2 Recent progress',
    ]);
    expect(text(root.querySelector('.heading p'))).toBe('Sample plan · November 12, 2026');
    expect(root.querySelectorAll('atlas-dimension-card')).toHaveLength(2);
    expect(Array.from(root.querySelectorAll('.recent-item'), text)).toEqual([
      'Completed · Step Buy running shoes',
      'Completed · Waypoint Run 10 km',
    ]);
    expect(text(root.querySelector('.timing'))).toContain('Progress reflects completed Steps.');
  });

  it('shows the Error state with Retry, and recovers', async () => {
    const { fixture, root } = await render([offline, () => of(testDashboard())]);

    expect(text(root.querySelector('h1'))).toBe('Your plan is still yours.');
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
    expect(root.querySelector('#atlas-last-saved')).toBeNull();

    root.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await fixture.whenStable();
    expect(text(root.querySelector('h1'))).toBe('Your next chapter.');
  });

  it('keeps focus on the page heading when the state changes', async () => {
    const response = new ReplaySubject<Dashboard>(1);
    const { fixture, root } = await render([() => response], false, false);
    document.body.appendChild(root);
    const loading = root.querySelector<HTMLElement>('h1')!;
    loading.setAttribute('tabindex', '-1');
    loading.focus();

    response.next(testDashboard());
    response.complete();
    await fixture.whenStable();

    expect(document.activeElement?.textContent?.trim()).toBe('Your next chapter.');
    root.remove();
  });

  it('keeps the last saved plan beside the error when a refresh fails', async () => {
    const { fixture, root } = await render([() => of(testDashboard()), offline]);

    fixture.debugElement.injector.get(AtlasOverviewStore).enter();
    await fixture.whenStable();

    expect(text(root.querySelector('h1'))).toBe('Your plan is still yours.');
    expect(text(root.querySelector('#atlas-last-saved'))).toBe('Run a marathon');
    expect(Array.from(root.querySelectorAll('.saved-lines li'), text)).toContain(
      'Next: Finish a half marathon · March 2027',
    );
  });

  describe('companion', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('suggests the next Waypoint and can be dismissed for the session', async () => {
      const { fixture, root } = await render([() => of(testDashboard())]);
      const card = root.querySelector('atlas-companion-card');

      expect(text(card?.querySelector('h2'))).toBe('Choose one meaningful next step.');
      expect(card?.querySelector('a[atlasCompanionAction]')?.getAttribute('href')).toBe(
        root.querySelector('atlas-next-waypoint-card a')?.getAttribute('href'),
      );

      card!.querySelector<HTMLButtonElement>('.dismiss')!.click();
      fixture.detectChanges();
      expect(root.querySelector('atlas-companion-card')).toBeNull();
    });

    it('stays hidden when the companion is disabled', async () => {
      localStorage.setItem(ATLAS_COMPANION_STORAGE_KEY, 'off');
      const { root } = await render([() => of(testDashboard())]);

      expect(root.querySelector('atlas-companion-card')).toBeNull();
    });

    it('encourages a first intention on the Empty state', async () => {
      const { fixture, root } = await render([() => of(emptyDashboard())]);
      const card = root.querySelector('atlas-companion-card');

      expect(text(card?.querySelector('h2'))).toBe('One meaningful intention is enough to begin.');
      expect(card?.querySelector('atlas-companion-avatar')?.getAttribute('data-expression')).toBe(
        'encouraging',
      );

      card!.querySelector<HTMLButtonElement>('.dismiss')!.click();
      fixture.detectChanges();
      expect(root.querySelector('atlas-companion-card')).toBeNull();
    });

    it('offers a supportive pause on the Error state', async () => {
      const { root } = await render([offline]);
      const card = root.querySelector('atlas-companion-card');

      expect(text(card?.querySelector('h2'))).toBe('Pause here, or try again when you are ready.');
      expect(card?.querySelector('atlas-companion-avatar')?.getAttribute('data-expression')).toBe(
        'supportive',
      );
    });
  });
});
