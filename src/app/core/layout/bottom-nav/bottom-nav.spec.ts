import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AtlasBottomNav } from './bottom-nav';

@Component({ imports: [AtlasBottomNav], template: '<atlas-bottom-nav />' })
class Page {}

describe('AtlasBottomNav', () => {
  async function render(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Page }])],
    });
    const harness = await RouterTestingHarness.create(url);
    const root = harness.fixture.nativeElement as HTMLElement;
    const item = (label: string) =>
      [...root.querySelectorAll('a')].find((a) => a.textContent?.trim() === label)!;
    return { root, item };
  }

  it('shows the five Figma items with short labels', async () => {
    const { root } = await render('/atlas');
    const labels = [...root.querySelectorAll('.label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual(['My Atlas', 'Destinations', 'Journey', 'Awards', 'More']);
  });

  it('marks the current area', async () => {
    const { item } = await render('/destinations/42');
    expect(item('Destinations').getAttribute('aria-current')).toBe('page');
    expect(item('Destinations').classList).toContain('is-active');
    expect(item('My Atlas').hasAttribute('aria-current')).toBe(false);
  });

  it('marks More as the current section for areas reached through it', async () => {
    const { item } = await render('/waypoints');
    expect(item('More').classList).toContain('is-active');
    expect(item('More').getAttribute('aria-current')).toBe('true');
  });

  it('marks More as current on the More page', async () => {
    const { item } = await render('/more');
    expect(item('More').getAttribute('aria-current')).toBe('page');
  });
});
