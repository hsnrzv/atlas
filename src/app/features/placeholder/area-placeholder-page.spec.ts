import { TestBed } from '@angular/core/testing';
import { AreaPlaceholderPage } from './area-placeholder-page';

describe('AreaPlaceholderPage', () => {
  it('shows the area title and description from the route data', async () => {
    const fixture = TestBed.createComponent(AreaPlaceholderPage);
    fixture.componentRef.setInput('heading', 'Connections');
    fixture.componentRef.setInput('description', 'People who walk with you.');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toBe('Connections');
    expect(root.querySelector('atlas-page-header .description')?.textContent).toBe(
      'People who walk with you.',
    );
    expect(root.querySelector('atlas-feedback-state h2')?.textContent).toBe(
      'This area is on its way',
    );
  });

  it('omits the description when the route has none', async () => {
    const fixture = TestBed.createComponent(AreaPlaceholderPage);
    fixture.componentRef.setInput('heading', 'Steps');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('atlas-page-header .description')).toBeNull();
  });
});
