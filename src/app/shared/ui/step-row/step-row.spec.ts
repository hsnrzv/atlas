import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasStepRow, type StepRowVm } from './step-row';

describe('AtlasStepRow', () => {
  const step: StepRowVm = {
    id: 'submit',
    title: 'Submit the application',
    status: 'not-started',
    blocked: true,
    meta: 'Due: Not set · No notes',
    link: '/destinations/g/steps/submit',
  };

  it('links the title and shows status and Blocked availability as separate labels', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AtlasStepRow);
    fixture.componentRef.setInput('step', step);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector('a')!;
    expect(link.textContent?.trim()).toBe('Submit the application');
    expect(link.getAttribute('href')).toBe('/destinations/g/steps/submit');
    const badges = [...host.querySelectorAll('atlas-status-badge')].map((badge) =>
      badge.textContent?.trim(),
    );
    expect(badges).toEqual(['Not started', 'Blocked']);
    expect(host.querySelector('.meta')?.textContent).toBe('Due: Not set · No notes');
  });
});
