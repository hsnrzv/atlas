import { TestBed } from '@angular/core/testing';
import { AtlasSkeleton } from './skeleton';

async function render(lines?: number): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(AtlasSkeleton);
  if (lines !== undefined) fixture.componentRef.setInput('lines', lines);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('AtlasSkeleton', () => {
  it('renders three decorative bars by default, the last one short', async () => {
    const host = await render();
    const bars = [...host.querySelectorAll('.bar')];

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(bars).toHaveLength(3);
    expect(bars.map((bar) => bar.classList.contains('is-short'))).toEqual([false, false, true]);
  });

  it('renders at least one full bar', async () => {
    const host = await render(0);
    const bars = host.querySelectorAll('.bar');

    expect(bars).toHaveLength(1);
    expect(bars[0].classList.contains('is-short')).toBe(false);
  });
});
