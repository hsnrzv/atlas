import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasBreadcrumbs } from './breadcrumbs';

describe('AtlasBreadcrumbs', () => {
  it('links the ancestors and marks the last item as the current page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AtlasBreadcrumbs);
    fixture.componentRef.setInput('items', [
      { label: 'Destinations', path: '/destinations' },
      { label: 'Study abroad' },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/destinations');
    const current = root.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Study abroad');
    expect(root.querySelectorAll('atlas-icon')).toHaveLength(1);
  });
});
