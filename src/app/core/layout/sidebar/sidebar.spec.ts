import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasSidebar } from './sidebar';

describe('AtlasSidebar', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function render(rail: boolean) {
    const fixture = TestBed.createComponent(AtlasSidebar);
    fixture.componentRef.setInput('rail', rail);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists the primary and account areas with visible labels', async () => {
    const root = await render(false);
    const labels = [...root.querySelectorAll('.label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual([
      'My Atlas',
      'Destinations',
      'Waypoints',
      'Steps',
      'Connections',
      'Journey Overview',
      'Milestone Awards',
      'Life Dimensions',
      'Settings',
      'Profile',
      'Help',
    ]);
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary');
    expect(root.querySelector('.footer')?.textContent).toContain('Your life, mapped with purpose.');
  });

  it('names icon-only rail links with their label', async () => {
    const root = await render(true);
    const links = [...root.querySelectorAll<HTMLAnchorElement>('atlas-nav-item a')];
    expect(links).toHaveLength(11);
    expect(links.every((link) => !!link.getAttribute('aria-label'))).toBe(true);
    expect(root.querySelector('.label')).toBeNull();
    expect(root.querySelector('.footer')).toBeNull();
  });
});
