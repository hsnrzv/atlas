import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { ConnectionsPage } from './connections-page';
import { ConnectionsStore } from './data-access/connections.store';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('ConnectionsPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample', inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode), ConnectionsStore],
    });
    const fixture = TestBed.createComponent(ConnectionsPage);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    for (let i = 0; i < 3; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('draws the sample graph with nothing selected', async () => {
    const root = await render('sample', { view: 'graph' });

    expect(text(root.querySelector('h1'))).toBe('Connections');
    expect(text(root.querySelector('#atlas-graph-title'))).toBe(
      'One destination. Two relationships.',
    );
    expect(root.querySelectorAll('atlas-connection-graph .node')).toHaveLength(3);
    expect(text(root.querySelector('#atlas-relationship-title'))).toBe(
      'Select a node to see the connection',
    );
  });

  it('reads the selected Finance relationship without inventing money', async () => {
    const root = await render('sample', { view: 'graph', selected: 'area:FINANCE' });
    const panel = text(root.querySelector('aside'));

    expect(panel).toContain('Selected relationship · Finance');
    expect(panel).toContain('Potential financial effect');
    expect(panel).toContain('No amount provided');
    expect(panel).toContain('Not set');
    expect(root.querySelector('aside a')?.getAttribute('href')).toBe(
      '/destinations/sample-goal-masters',
    );
  });

  it('lists the relationships as cards', async () => {
    const root = await render('sample', { view: 'list' });

    expect(Array.from(root.querySelectorAll('.relationship .kind'), text)).toEqual([
      'Primary assignment · association',
      'Possible impact · illustrative / unverified',
    ]);
  });

  it('explains when there are no connections', async () => {
    const root = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No connections yet');
  });

  it('offers a retry when the connections cannot load', async () => {
    const root = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('Connections could not load');
  });
});
