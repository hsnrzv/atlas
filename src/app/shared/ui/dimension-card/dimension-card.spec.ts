import { TestBed } from '@angular/core/testing';
import { AtlasDimensionCard } from './dimension-card';

async function render(inputs: { destinations?: number; progress?: number | null }) {
  const fixture = TestBed.createComponent(AtlasDimensionCard);
  fixture.componentRef.setInput('dimension', 'career');
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('AtlasDimensionCard', () => {
  it('shows the name, Destination count and backend progress', async () => {
    const root = await render({ destinations: 1, progress: 20 });
    const bar = root.querySelector('[role="progressbar"]')!;

    expect(root.querySelector('h3')?.textContent).toBe('Career');
    expect(root.querySelector('.count')?.textContent).toBe('1 destination');
    expect(root.querySelector('.value')?.textContent).toBe('20%');
    expect(bar.getAttribute('aria-label')).toBe('Career progress');
    expect(bar.getAttribute('aria-valuenow')).toBe('20');
    expect(bar.getAttribute('aria-valuetext')).toBe('20%');
  });

  it('shows an empty dimension as 0 %', async () => {
    const root = await render({ destinations: 0, progress: null });

    expect(root.querySelector('.count')?.textContent).toBe('No destinations yet');
    expect(root.querySelector('.value')?.textContent).toBe('0%');
  });

  it('pluralises and clamps', async () => {
    const root = await render({ destinations: 3, progress: 140 });

    expect(root.querySelector('.count')?.textContent).toBe('3 destinations');
    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('100');
  });

  it('takes the dimension colour from the tokens', async () => {
    const root = await render({});
    expect(root.style.getPropertyValue('--atlas-dimension-color')).toContain(
      'var(--color-dimension-career',
    );
  });
});
