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

async function render(selected: string | null = null) {
  const fixture = TestBed.createComponent(AtlasConnectionGraph);
  fixture.componentRef.setInput('nodes', nodes);
  fixture.componentRef.setInput('edges', edges);
  fixture.componentRef.setInput('selected', selected);
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

  it('widens the stage with the zoom and focuses a node', async () => {
    const { fixture, root } = await render();
    fixture.componentRef.setInput('zoom', 1.5);
    await fixture.whenStable();
    expect(root.querySelector<HTMLElement>('.stage')?.style.inlineSize).toBe('150%');

    fixture.componentInstance.focusNode('area:CAREER');
    expect(document.activeElement?.getAttribute('data-id')).toBe('area:CAREER');
    fixture.componentInstance.focusNode('unknown');
    expect(document.activeElement?.getAttribute('data-id')).toBe('goal:g1');
  });
});
