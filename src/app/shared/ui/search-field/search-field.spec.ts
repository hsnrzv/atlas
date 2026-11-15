import { TestBed } from '@angular/core/testing';
import { AtlasSearchField } from './search-field';

describe('AtlasSearchField', () => {
  async function render(error?: string) {
    const fixture = TestBed.createComponent(AtlasSearchField);
    fixture.componentRef.setInput('label', 'Search Destinations');
    fixture.componentRef.setInput('error', error);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, input: host.querySelector('input')! };
  }

  it('is a named search landmark that updates its value', async () => {
    const { fixture, host, input } = await render();
    expect(host.getAttribute('role')).toBe('search');
    expect(input.getAttribute('aria-label')).toBe('Search Destinations');
    expect(input.type).toBe('search');
    input.value = 'study';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('study');
  });

  it('shows the error message and marks the input invalid', async () => {
    const { host, input } = await render('Use at least two characters.');
    expect(host.querySelector('mat-error')?.textContent).toContain('Use at least two characters.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
