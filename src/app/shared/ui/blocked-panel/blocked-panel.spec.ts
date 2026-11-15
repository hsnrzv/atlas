import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasBlockedPanel, type BlockedReasonVm } from './blocked-panel';

@Component({
  imports: [AtlasBlockedPanel],
  template: `<atlas-blocked-panel kind="Step" [reasons]="reasons" />`,
})
class Host {
  reasons: BlockedReasonVm[] = [
    { id: 'a', title: 'Review application checklist', status: 'Not started', link: '/x/steps/a' },
    { id: 'b', title: 'Removed prerequisite', status: 'In progress', link: null },
  ];
}

describe('AtlasBlockedPanel', () => {
  it('names each prerequisite with its status and a link when it can be opened', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="heading"]')?.textContent).toBe('Blocked');
    expect(element.textContent).toContain(
      'This Step becomes available when these prerequisites are',
    );
    const items = element.querySelectorAll('li');
    expect(items[0].textContent).toContain('Review application checklist · Not started');
    expect(items[0].querySelector('a')?.getAttribute('href')).toBe('/x/steps/a');
    expect(items[0].querySelector('a')?.textContent).toContain(
      'View prerequisite: Review application checklist',
    );
    expect(items[1].querySelector('a')).toBeNull();
  });
});
