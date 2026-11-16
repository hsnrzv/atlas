import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CompanionPreferencesStore } from '../../core/companion/companion-preferences.store';
import { GoalRepository } from '../../core/data-access/ports';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  SAMPLE_NODE_IDS,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { AwardsStore } from './data-access/awards.store';
import { AwardsPage } from './awards-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

const N = SAMPLE_NODE_IDS;
const APPLICATION_STEPS = [
  N.confirmRequirements,
  N.gatherRecords,
  N.draftStatement,
  N.reviewChecklist,
  N.submitTheApplication,
];

describe('AwardsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  function configure(mode: MockMode) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...providePlanTesting(mode),
        AwardsStore,
        { provide: AtlasToast, useValue: { show: vi.fn() } },
      ],
    });
  }

  async function settle(fixture: { detectChanges(): void }) {
    for (let i = 0; i < 4; i++) {
      fixture.detectChanges();
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
  }

  async function render(mode: MockMode = 'sample') {
    configure(mode);
    const fixture = TestBed.createComponent(AwardsPage);
    await settle(fixture);
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  async function completeApplication() {
    const goals = TestBed.inject(GoalRepository);
    for (const step of APPLICATION_STEPS) {
      const done = firstValueFrom(goals.completeNode(SAMPLE_GOAL_ID, step));
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
      await done;
    }
  }

  it('shows the planned celebration without claiming it is earned', async () => {
    const { root } = await render();

    expect(text(root.querySelector('h1'))).toBe('Milestone Awards');
    expect(text(root.querySelector('.summary-title'))).toBe('0 Earned');
    expect(text(root.querySelector('.planned'))).toBe('1 Planned · Graduation celebration');
    expect(text(root.querySelector('.award-title'))).toBe('Graduation celebration');
    expect(text(root.querySelector('.award .status'))).toBe('Planned · not earned');
    expect(root.querySelector('atlas-companion-card')).toBeNull();
    expect(text(root.querySelector('.history .card'))).toContain('No Waypoint achieved yet');
    expect(text(root.querySelector('.destination .eyebrow'))).toBe('Linked Destination · Career');
    expect(text(root.querySelector('#atlas-awards-next'))).toBe('Next Milestones');
    expect(text(root.querySelector('.next-title'))).toBe('Submit application');
    expect(root.querySelector('.next-item atlas-status-badge')).not.toBeNull();
  });

  it('celebrates an achieved Waypoint with the optional companion', async () => {
    configure('sample');
    await completeApplication();
    const fixture = TestBed.createComponent(AwardsPage);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    const card = root.querySelector('atlas-companion-card');
    expect(text(card?.querySelector('h2'))).toBe('A meaningful step forward');
    expect(text(card?.querySelector('.body'))).toBe('Submit application is complete.');
    expect(text(root.querySelector('.note'))).toBe(
      'No points. Graduation celebration remains planned.',
    );
    expect(text(root.querySelector('.history-title'))).toBe('Submit application');

    const mute = Array.from(card?.querySelectorAll('button') ?? []).find(
      (button) => text(button) === 'Mute',
    );
    mute?.click();
    fixture.detectChanges();
    expect(TestBed.inject(CompanionPreferencesStore).mode()).toBe('muted');
    expect(root.querySelector('atlas-companion-card')?.classList).toContain('is-muted');

    (root.querySelector('atlas-companion-card .dismiss') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.querySelector('atlas-companion-card')).toBeNull();
  });

  it('invites a first award when nothing is planned', async () => {
    const { root } = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Milestone Awards yet');
  });

  it('offers a retry when the awards cannot load', async () => {
    const { root } = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'Milestone Awards could not load',
    );
  });
});
