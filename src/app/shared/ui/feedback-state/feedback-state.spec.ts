import { TestBed } from '@angular/core/testing';
import { AtlasFeedbackState, AtlasFeedbackKind } from './feedback-state';

describe('AtlasFeedbackState', () => {
  async function render(kind: AtlasFeedbackKind) {
    const fixture = TestBed.createComponent(AtlasFeedbackState);
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('title', 'No Destinations yet');
    fixture.componentRef.setInput('description', 'Add your first Destination.');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders an empty state as a polite status', async () => {
    const host = await render('empty');
    expect(host.getAttribute('role')).toBe('status');
    expect(host.querySelector('h2')?.textContent).toBe('No Destinations yet');
    expect(host.querySelector('.description')?.textContent).toBe('Add your first Destination.');
  });

  it('announces errors as alerts', async () => {
    expect((await render('error')).getAttribute('role')).toBe('alert');
  });

  it('shows skeleton bars and a hidden message while loading', async () => {
    const host = await render('loading');
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('.atlas-visually-hidden')?.textContent).toBe('No Destinations yet');
    expect(host.querySelector('atlas-skeleton')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelectorAll('.bar')).toHaveLength(3);
  });
});
