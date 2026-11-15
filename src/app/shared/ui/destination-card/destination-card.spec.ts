import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasDestinationCard, type DestinationCardVm } from './destination-card';

const destination: DestinationCardVm = {
  id: 'g1',
  title: 'Complete a Master’s degree',
  dimension: 'career',
  status: 'in-progress',
  progress: { value: 20, detail: '2 of 10' },
  nextWaypoint: 'Submit application',
  targetDate: { date: '2030-01-01', precision: 'YEAR' },
  link: '/destinations/g1',
};

async function render(value: DestinationCardVm) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(AtlasDestinationCard);
  fixture.componentRef.setInput('destination', value);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('AtlasDestinationCard', () => {
  it('is a single link named by its heading', async () => {
    const root = await render(destination);
    const links = root.querySelectorAll('a');

    expect(links).toHaveLength(1);
    expect(links[0].closest('h3')).not.toBeNull();
    expect(links[0].textContent).toBe('Complete a Master’s degree');
    expect(links[0].getAttribute('href')).toBe('/destinations/g1');
  });

  it('shows dimension, status, progress and facts', async () => {
    const root = await render(destination);
    const facts = Array.from(root.querySelectorAll('dl > div'), (row) =>
      Array.from(row.children, (cell) => cell.textContent?.trim()).join(': '),
    );

    expect(root.querySelector('atlas-dimension-badge')?.textContent).toContain('Career');
    expect(root.querySelector('atlas-status-badge')?.textContent).toContain('In progress');
    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      '20% · 2 of 10',
    );
    expect(facts).toEqual(['Next Waypoint: Submit application', 'Target: 2030']);
  });

  it('says when nothing is planned', async () => {
    const root = await render({ ...destination, nextWaypoint: null, targetDate: null });
    const facts = root.querySelector('dl')?.textContent?.replace(/\s+/g, ' ');

    expect(facts).toContain('None planned');
    expect(facts).toContain('Date not set');
  });
});
