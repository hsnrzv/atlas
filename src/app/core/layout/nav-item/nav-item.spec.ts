import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DESTINATIONS, MY_ATLAS } from '../navigation';
import { AtlasNavItem } from './nav-item';

@Component({
  imports: [AtlasNavItem],
  template: `
    <atlas-nav-item [link]="atlas" [compact]="compact" />
    <atlas-nav-item [link]="destinations" [compact]="compact" />
  `,
})
class NavHost {
  static compact = false;
  protected readonly atlas = MY_ATLAS;
  protected readonly destinations = DESTINATIONS;
  protected readonly compact = NavHost.compact;
}

describe('AtlasNavItem', () => {
  async function render(compact: boolean) {
    NavHost.compact = compact;
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: NavHost }])],
    });
    const harness = await RouterTestingHarness.create('/destinations');
    return harness.routeNativeElement!.querySelectorAll('a');
  }

  it('marks only the current area with aria-current', async () => {
    const [atlas, destinations] = await render(false);
    expect(atlas.textContent?.trim()).toBe('My Atlas');
    expect(atlas.hasAttribute('aria-current')).toBe(false);
    expect(destinations.getAttribute('aria-current')).toBe('page');
    expect(destinations.classList).toContain('is-active');
  });

  it('uses the label as the accessible name in the rail', async () => {
    const [atlas] = await render(true);
    expect(atlas.textContent?.trim()).toBe('');
    expect(atlas.getAttribute('aria-label')).toBe('My Atlas');
  });
});
