import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { journeyScale } from './journey-scale';
import { AtlasJourneyTimeline, type JourneyLane } from './journey-timeline';

const lanes: JourneyLane[] = [
  {
    id: 'a',
    label: 'Submit application',
    date: '2026-12-01',
    caption: 'Dec 2026 · month',
    marker: 'solid',
    dimension: 'career',
    link: '/destinations/g/waypoints/a',
    accessibleName: 'Submit application, December 2026, month precision, In progress',
  },
  {
    id: 'b',
    label: 'Graduate',
    date: '2030-01-01',
    caption: '2030 · year',
    marker: 'dashed',
    dimension: 'career',
    link: '/destinations/g/waypoints/b',
    accessibleName: 'Graduate, 2030, year precision, Not started',
  },
];

describe('AtlasJourneyTimeline', () => {
  function render(today = '2026-11-12') {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AtlasJourneyTimeline);
    fixture.componentRef.setInput('lanes', lanes);
    fixture.componentRef.setInput(
      'scale',
      journeyScale('all', '2026-11-12', ['2026-12-01', '2030-01-01'], 'en-US'),
    );
    fixture.componentRef.setInput('today', { date: today, label: 'Today · 12 Nov 2026' });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links every Waypoint with its full date and status as the name', () => {
    const root = render();
    const links = Array.from(root.querySelectorAll('a.marker'));

    expect(links.map((link) => link.querySelector('.atlas-visually-hidden')?.textContent)).toEqual([
      lanes[0].accessibleName,
      lanes[1].accessibleName,
    ]);
    expect(links[0].getAttribute('href')).toBe('/destinations/g/waypoints/a');
    expect(root.querySelector('ol')?.getAttribute('aria-label')).toBe('Journey timeline');
  });

  it('draws coarse dates dashed and places markers in time order', () => {
    const root = render();
    const dots = root.querySelectorAll('.dot');
    const offsets = Array.from(root.querySelectorAll<HTMLElement>('a.marker'), (link) =>
      parseFloat(link.style.insetInlineStart),
    );

    expect(dots[0].classList).not.toContain('is-dashed');
    expect(dots[1].classList).toContain('is-dashed');
    expect(offsets[0]).toBeLessThan(offsets[1]);
    expect(root.querySelectorAll('.tick')).toHaveLength(6);
  });

  it('shows the Today line only inside the range', () => {
    expect(render().querySelector('.today')?.textContent?.trim()).toBe('Today · 12 Nov 2026');
    TestBed.resetTestingModule();
    expect(render('2040-01-01').querySelector('.today')).toBeNull();
  });
});
