import { TestBed } from '@angular/core/testing';
import { AtlasGlanceSummary } from './glance-summary/glance-summary';
import { AtlasHero } from './hero/atlas-hero';

describe('AtlasHero', () => {
  it('is a region named by its title and shows the backend progress', async () => {
    const fixture = TestBed.createComponent(AtlasHero);
    fixture.componentRef.setInput('percent', 20);
    fixture.componentRef.setInput('percentText', '20%');
    fixture.componentRef.setInput('detail', '2 of 10');
    fixture.componentRef.setInput('achieved', '0 Waypoints achieved');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const title = root.querySelector('h2')!;

    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toBe('Build the life you envision.');
    expect(root.querySelector('.metric')?.textContent).toBe('20%');
    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      '20% · 2 of 10',
    );
    expect(root.querySelector('.achieved')?.textContent).toBe('0 Waypoints achieved');
  });
});

describe('AtlasGlanceSummary', () => {
  it('lists each value with its label', async () => {
    const fixture = TestBed.createComponent(AtlasGlanceSummary);
    fixture.componentRef.setInput('items', [
      { value: '1', label: 'Active destination' },
      { value: 'December 2026', label: 'Next planned deadline' },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = Array.from(
      root.querySelectorAll('li'),
      (row) =>
        `${row.querySelector('.value')?.textContent} | ${row.querySelector('.label')?.textContent}`,
    );

    expect(root.getAttribute('aria-labelledby')).toBe(root.querySelector('h2')?.id);
    expect(rows).toEqual(['1 | Active destination', 'December 2026 | Next planned deadline']);
  });
});
