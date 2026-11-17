import { TestBed } from '@angular/core/testing';
import {
  AtlasConnectionGraph,
  type ConnectionGraphEdge,
  type ConnectionGraphNode,
} from './connection-graph';

const nodes: ConnectionGraphNode[] = [
  {
    id: 'goal:g1',
    column: 'source',
    label: 'CS / AI Master’s · 20%',
    caption: 'Destination',
    icon: 'destinations',
    dimension: null,
    accessibleName: 'CS / AI Master’s, Destination, 2 relationships',
  },
  {
    id: 'goal:g2',
    column: 'source',
    label: 'Gym session · 0%',
    caption: 'Destination',
    icon: 'destinations',
    dimension: null,
    accessibleName: 'Gym session, Destination, 1 relationship',
  },
  {
    id: 'area:CAREER',
    column: 'target',
    label: 'Career',
    caption: 'Career',
    icon: 'career',
    dimension: 'career',
    accessibleName: 'Career, 1 relationship',
  },
  {
    id: 'area:FINANCE',
    column: 'target',
    label: 'Finance',
    caption: 'Finance',
    icon: 'finance',
    dimension: 'finance',
    accessibleName: 'Finance, 1 relationship',
  },
];
const edges: ConnectionGraphEdge[] = [
  { id: 'c1', source: 'goal:g1', target: 'area:CAREER', line: 'solid' },
  { id: 'c2', source: 'goal:g1', target: 'area:FINANCE', line: 'dashed' },
];

async function render(selected: string | null = null, extra: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(AtlasConnectionGraph);
  fixture.componentRef.setInput('nodes', nodes);
  fixture.componentRef.setInput('edges', edges);
  fixture.componentRef.setInput('selected', selected);
  for (const [name, value] of Object.entries(extra)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('AtlasConnectionGraph', () => {
  it('renders every node as a named toggle button and the curves as decoration', async () => {
    const { root } = await render();
    const buttons = [...root.querySelectorAll('button')];

    expect(
      buttons.map((button) => button.querySelector('.atlas-visually-hidden')?.textContent),
    ).toEqual(nodes.map((node) => node.accessibleName));
    expect(buttons.every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('[data-edge="c2"]')?.classList).toContain('is-dashed');
    expect(root.querySelector('[data-edge="c1"]')?.classList).not.toContain('is-dashed');
  });

  it('highlights the selection and emits toggles', async () => {
    const { fixture, root } = await render('area:FINANCE');
    const emitted: (string | null)[] = [];
    fixture.componentInstance.selectedChange.subscribe((id) => emitted.push(id));

    const finance = root.querySelector<HTMLButtonElement>('[data-id="area:FINANCE"]')!;
    expect(finance.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-edge="c2"]')?.classList).toContain('is-active');
    expect(root.querySelector('[data-edge="c1"]')?.classList).not.toContain('is-active');

    finance.click();
    root.querySelector<HTMLButtonElement>('[data-id="area:CAREER"]')!.click();
    expect(emitted).toEqual([null, 'area:CAREER']);
  });

  it('scales the stage with the zoom and focuses a node', async () => {
    const { fixture, root } = await render();
    fixture.componentRef.setInput('zoom', 1.5);
    await fixture.whenStable();
    expect(root.querySelector<HTMLElement>('.stage')?.style.zoom).toBe('1.5');

    fixture.componentInstance.focusNode('area:CAREER');
    expect(document.activeElement?.getAttribute('data-id')).toBe('area:CAREER');
    fixture.componentInstance.focusNode('unknown');
    expect(document.activeElement?.getAttribute('data-id')).toBe('goal:g1');
  });

  describe('connect mode', () => {
    const node = (root: HTMLElement, id: string) =>
      root.querySelector<HTMLButtonElement>(`[data-id="${id}"]`)!;

    it('asks to connect a selected Destination to a Life Dimension without an association', async () => {
      const { fixture, root } = await render('goal:g1', { connectable: true });
      const requests: unknown[] = [];
      const selections: (string | null)[] = [];
      fixture.componentInstance.connectRequest.subscribe((request) => requests.push(request));
      fixture.componentInstance.selectedChange.subscribe((id) => selections.push(id));

      // Finance only has a dashed possible impact, so it can still be connected.
      node(root, 'area:FINANCE').click();
      expect(requests).toEqual([{ source: 'goal:g1', target: 'area:FINANCE' }]);
      // Career is already associated: reading it is the same as before.
      node(root, 'area:CAREER').click();
      expect(selections).toEqual(['area:CAREER']);
    });

    it('only selects without connect mode', async () => {
      const { fixture, root } = await render('goal:g1');
      const requests: unknown[] = [];
      fixture.componentInstance.connectRequest.subscribe((request) => requests.push(request));
      node(root, 'area:FINANCE').click();
      expect(requests).toEqual([]);
    });

    it('draws a decorative line to the mouse while a Destination is selected', async () => {
      const { fixture, root } = await render('goal:g1', { connectable: true });
      const stage = root.querySelector<HTMLElement>('.stage')!;
      stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 500, height: 200 }) as DOMRect;

      stage.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 250, clientY: 100, pointerType: 'mouse' }),
      );
      await fixture.whenStable();
      const pending = root.querySelector('.line.is-pending');
      expect(pending?.closest('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(pending?.getAttribute('d')).toMatch(/ 500 \d+(\.\d+)?$/);

      stage.dispatchEvent(new PointerEvent('pointerleave'));
      await fixture.whenStable();
      expect(root.querySelector('.line.is-pending')).toBeNull();
    });

    it('locks the other Destinations on compact screens until the selection is cleared', async () => {
      const { fixture, root } = await render('goal:g1', { connectable: true, lockSources: true });
      const selections: (string | null)[] = [];
      fixture.componentInstance.selectedChange.subscribe((id) => selections.push(id));

      const other = node(root, 'goal:g2');
      expect(other.getAttribute('aria-disabled')).toBe('true');
      expect(other.classList).toContain('is-locked');
      expect(node(root, 'goal:g1').hasAttribute('aria-disabled')).toBe(false);
      other.click();
      expect(selections).toEqual([]);

      node(root, 'goal:g1').click();
      expect(selections).toEqual([null]);
    });

    it('clears the selection with Escape', async () => {
      const { fixture, root } = await render('goal:g1', { connectable: true });
      const selections: (string | null)[] = [];
      fixture.componentInstance.selectedChange.subscribe((id) => selections.push(id));
      node(root, 'goal:g1').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      expect(selections).toEqual([null]);
    });
  });
});
