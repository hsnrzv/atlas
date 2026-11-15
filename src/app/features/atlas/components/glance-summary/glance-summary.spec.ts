import { TestBed } from '@angular/core/testing';
import { AtlasGlanceSummary } from './glance-summary';

describe('AtlasGlanceSummary', () => {
  it('lists each count value first in a region named by its heading', async () => {
    const fixture = TestBed.createComponent(AtlasGlanceSummary);
    fixture.componentRef.setInput('items', [
      { value: '3', label: 'Waypoints planned' },
      { value: '1', label: 'Steps this week' },
    ]);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    const heading = host.querySelector('h2');
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(heading?.textContent).toBe('At a glance');
    const rows = [...host.querySelectorAll('li')].map((row) => [
      row.querySelector('.value')?.textContent,
      row.querySelector('.label')?.textContent,
    ]);
    expect(rows).toEqual([
      ['3', 'Waypoints planned'],
      ['1', 'Steps this week'],
    ]);
  });

  it('gives every instance its own heading id', () => {
    const first = TestBed.createComponent(AtlasGlanceSummary);
    const second = TestBed.createComponent(AtlasGlanceSummary);
    first.componentRef.setInput('items', []);
    second.componentRef.setInput('items', []);
    first.detectChanges();
    second.detectChanges();

    expect(first.nativeElement.getAttribute('aria-labelledby')).not.toBe(
      second.nativeElement.getAttribute('aria-labelledby'),
    );
  });
});
