import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasPageHeader } from './page-header';

@Component({
  imports: [AtlasPageHeader],
  template: `
    <atlas-page-header title="Destinations" description="Where you are heading.">
      <button pageHeaderAction>New Destination</button>
    </atlas-page-header>
  `,
})
class Host {}

describe('AtlasPageHeader', () => {
  it('renders the page heading, description and projected action', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toBe('Destinations');
    expect(root.querySelector('.description')?.textContent).toBe('Where you are heading.');
    expect(root.querySelector('.actions button')?.textContent).toBe('New Destination');
  });
});
