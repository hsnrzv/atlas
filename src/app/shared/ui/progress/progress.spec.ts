import { TestBed } from '@angular/core/testing';
import { AtlasProgress } from './progress';

describe('AtlasProgress', () => {
  async function render(value: number, detail?: string) {
    const fixture = TestBed.createComponent(AtlasProgress);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('label', 'Destination progress');
    fixture.componentRef.setInput('detail', detail);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { host, bar: host.querySelector<HTMLElement>('[role="progressbar"]')! };
  }

  it('exposes the backend value as an accessible progress bar', async () => {
    const { host, bar } = await render(20, '2 of 10 Waypoints');
    expect(bar.getAttribute('aria-label')).toBe('Destination progress');
    expect(bar.getAttribute('aria-valuenow')).toBe('20');
    expect(bar.getAttribute('aria-valuetext')).toBe('20% · 2 of 10 Waypoints');
    expect(host.querySelector('.text')?.textContent).toBe('20% · 2 of 10 Waypoints');
    expect(host.querySelector<HTMLElement>('.fill')?.style.inlineSize).toBe('20%');
  });

  it('keeps out-of-range values inside the track', async () => {
    const { bar } = await render(140);
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
  });
});
