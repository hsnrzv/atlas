import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { breakpoints } from '../../../shared/design-system/tokens.generated';
import { AtlasTitleStrategy } from '../atlas-title-strategy';
import { AtlasAppShell } from './app-shell';
import { TitleStrategy } from '@angular/router';

@Component({ template: '<h1>Destinations</h1>' })
class DestinationsStub {}

@Component({ template: '<h1>Settings</h1>' })
class SettingsStub {}

const RAIL = `(min-width: ${breakpoints.md}px)`;
const SIDEBAR = `(min-width: ${breakpoints.lg}px)`;

function viewport(width: number): BreakpointState {
  const rail = width >= breakpoints.md;
  const sidebar = width >= breakpoints.lg;
  return { matches: rail || sidebar, breakpoints: { [RAIL]: rail, [SIDEBAR]: sidebar } };
}

describe('AtlasAppShell', () => {
  let state: BehaviorSubject<BreakpointState>;

  async function render(width: number, url = '/destinations') {
    state = new BehaviorSubject(viewport(width));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: AtlasAppShell,
            children: [
              { path: 'destinations', title: 'Destinations', component: DestinationsStub },
              { path: 'settings', title: 'Settings', component: SettingsStub },
            ],
          },
        ]),
        { provide: TitleStrategy, useExisting: AtlasTitleStrategy },
        { provide: BreakpointObserver, useValue: { observe: () => state } },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, root: harness.fixture.nativeElement as HTMLElement };
  }

  it('renders the full sidebar from 1024 px', async () => {
    const { root } = await render(1440);
    expect(root.querySelector('atlas-app-shell')?.getAttribute('data-layout')).toBe('sidebar');
    expect(root.querySelector('atlas-sidebar')?.classList).not.toContain('is-rail');
    expect(root.querySelector('atlas-bottom-nav')).toBeNull();
    expect(root.querySelector('atlas-topbar .brand')).toBeNull();
  });

  it('renders the icon rail between 768 and 1023 px', async () => {
    const { root } = await render(800);
    expect(root.querySelector('atlas-sidebar')?.classList).toContain('is-rail');
    expect(root.querySelector('atlas-sidebar .group-label')).toBeNull();
    expect(root.querySelector('atlas-topbar .brand')).not.toBeNull();
  });

  it('renders the bottom navigation below 768 px', async () => {
    const { root } = await render(390);
    expect(root.querySelector('atlas-sidebar')).toBeNull();
    expect(root.querySelector('nav[aria-label="Primary"] atlas-bottom-nav')).not.toBeNull();
  });

  it('has one main landmark, a banner and a skip link that focuses main', async () => {
    const { root } = await render(1440);
    expect(root.querySelectorAll('main#main')).toHaveLength(1);
    expect(root.querySelector('header atlas-topbar')).not.toBeNull();
    const skip = root.querySelector<HTMLAnchorElement>('.atlas-skip-link')!;
    skip.click();
    expect(document.activeElement?.id).toBe('main');
  });

  it('shows the page title in the top bar', async () => {
    const { harness, root } = await render(1440);
    expect(root.querySelector('atlas-topbar .title')?.textContent).toContain('Destinations');
    await harness.navigateByUrl('/settings');
    expect(root.querySelector('atlas-topbar .title')?.textContent).toContain('Settings');
    expect(document.title).toBe('Settings · IKIGAI ATLAS');
  });

  it('marks the active navigation item as the current page', async () => {
    const { root } = await render(1440);
    const current = root.querySelectorAll('atlas-sidebar [aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain('Destinations');
  });
});
