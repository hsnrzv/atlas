import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { ATLAS_ENVIRONMENT, AtlasEnvironment } from './core/config/atlas-environment';

function setup(devTools: boolean) {
  const environment: AtlasEnvironment = { dataSource: 'mock', devTools, companionArt: false };
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes, withComponentInputBinding()),
      { provide: ATLAS_ENVIRONMENT, useValue: environment },
    ],
  });
}

describe('App routes', () => {
  it('creates the app', () => {
    setup(true);
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('redirects the root to My Atlas inside the shell', async () => {
    setup(true);
    const harness = await RouterTestingHarness.create('/');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('main h1')?.textContent).toContain('My Atlas');
    expect(root.querySelector('atlas-app-shell')).not.toBeNull();
  });

  it('renders the More page', async () => {
    setup(true);
    const harness = await RouterTestingHarness.create('/more');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('main h1')?.textContent).toContain('More of your Atlas');
  });

  it('shows the not-found page for unknown paths', async () => {
    setup(true);
    const harness = await RouterTestingHarness.create('/nowhere');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('main h1')?.textContent).toContain('Page not found');
  });

  it('serves /_design outside the shell in development builds', async () => {
    setup(true);
    const harness = await RouterTestingHarness.create('/_design');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('atlas-app-shell')).toBeNull();
    expect(root.querySelector('h1')?.textContent).toContain('See the whole.');
  });

  it('hides /_design in production builds', async () => {
    setup(false);
    const harness = await RouterTestingHarness.create('/_design');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('main h1')?.textContent).toContain('Page not found');
  });
});
