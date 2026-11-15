import { TestBed } from '@angular/core/testing';
import { AtlasHero } from './atlas-hero';

describe('AtlasHero', () => {
  it('shows the backend progress in a labelled region and progress bar', async () => {
    const fixture = TestBed.createComponent(AtlasHero);
    fixture.componentRef.setInput('percent', 42);
    fixture.componentRef.setInput('percentText', '42%');
    fixture.componentRef.setInput('detail', 'On track');
    fixture.componentRef.setInput('achieved', '2 of 5 Waypoints achieved');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    const heading = host.querySelector('h2');
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(heading?.textContent).toBe('Build the life you envision.');
    expect(host.querySelector('.metric')?.textContent).toBe('42%');
    expect(host.querySelector('.metric')?.getAttribute('aria-hidden')).toBe('true');
    const bar = host.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-label')).toBe('Destination progress');
    expect(bar?.getAttribute('aria-valuenow')).toBe('42');
    expect(host.querySelector('.achieved')?.textContent).toBe('2 of 5 Waypoints achieved');
  });
});
