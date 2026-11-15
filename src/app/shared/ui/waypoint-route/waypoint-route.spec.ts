import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasWaypointRoute, type WaypointStopVm } from './waypoint-route';

describe('AtlasWaypointRoute', () => {
  const stop = (overrides: Partial<WaypointStopVm>): WaypointStopVm => ({
    id: 'a',
    title: 'Submit application',
    status: 'in-progress',
    blocked: false,
    dateText: 'December 2026 · month precision',
    detail: '2 of 5 steps completed',
    link: '/destinations/g/waypoints/a',
    current: false,
    ...overrides,
  });

  async function render(stops: WaypointStopVm[], legend = false) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AtlasWaypointRoute);
    fixture.componentRef.setInput('stops', stops);
    fixture.componentRef.setInput('label', 'Your route');
    fixture.componentRef.setInput('legend', legend);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists Waypoints in order with status, date and the current stop', async () => {
    const host = await render([
      stop({ current: true }),
      stop({ id: 'b', title: 'Graduate', status: 'not-started', detail: null }),
    ]);
    const list = host.querySelector('ol')!;
    expect(list.getAttribute('aria-label')).toBe('Your route');
    const items = list.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('a')?.getAttribute('aria-current')).toBe('step');
    expect(items[0].textContent).toContain('Next focus');
    expect(items[0].textContent).toContain('December 2026 · month precision');
    expect(items[1].querySelector('a')?.getAttribute('aria-current')).toBeNull();
    expect(items[1].querySelector('.detail')).toBeNull();
  });

  it('shows a legend of the statuses present, including Blocked', async () => {
    const host = await render(
      [stop({}), stop({ id: 'b', status: 'success', blocked: true })],
      true,
    );
    const legend = [...host.querySelectorAll('.legend li')].map((item) => item.textContent?.trim());
    expect(legend).toEqual(['Completed', 'In progress', 'Blocked']);
  });
});
