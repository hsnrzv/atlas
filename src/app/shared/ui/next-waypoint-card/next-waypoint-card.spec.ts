import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasNextWaypointCard, type NextWaypointVm } from './next-waypoint-card';

const waypoint: NextWaypointVm = {
  id: 'n1',
  title: 'Submit application',
  dimension: 'career',
  status: 'in-progress',
  plannedDate: { date: '2026-12-01', precision: 'MONTH' },
  progress: { value: 40, detail: '2 of 5' },
  link: '/waypoints',
};

async function render(value: NextWaypointVm) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(AtlasNextWaypointCard);
  fixture.componentRef.setInput('waypoint', value);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('AtlasNextWaypointCard', () => {
  it('shows the dimension, title, status, planned date and progress', async () => {
    const root = await render(waypoint);

    expect(root.querySelector('.eyebrow')?.textContent).toContain('Next Waypoint · Career');
    expect(root.querySelector('h3')?.textContent).toContain('Submit application');
    expect(root.querySelector('atlas-status-badge')?.textContent).toContain('In progress');
    expect(root.querySelector('.planned')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Planned December 2026 · month precision',
    );
    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      '40% · 2 of 5',
    );
  });

  it('links to the Waypoint and is described by its title', async () => {
    const root = await render(waypoint);
    const link = root.querySelector('a')!;
    const title = root.querySelector('h3')!;

    expect(link.getAttribute('href')).toBe('/waypoints');
    expect(link.textContent).toContain('Explore next waypoint');
    expect(link.getAttribute('aria-describedby')).toBe(title.id);
  });

  it('handles a Waypoint without date or progress', async () => {
    const root = await render({ ...waypoint, plannedDate: null, progress: null });

    expect(root.querySelector('.planned')?.textContent?.trim()).toBe('Date not set');
    expect(root.querySelector('atlas-progress')).toBeNull();
  });
});
