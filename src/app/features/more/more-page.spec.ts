import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MorePage } from './more-page';

describe('MorePage', () => {
  it('lists the remaining areas in labelled groups and links back home', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MorePage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toBe('More of your Atlas');
    expect(root.querySelector('a.back')?.getAttribute('href')).toBe('/atlas');
    const groups = [...root.querySelectorAll('section')];
    expect(groups.map((group) => group.querySelector('h2')?.textContent)).toEqual([
      'Your Atlas',
      'Your space',
    ]);
    expect([...groups[0].querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      '/waypoints',
      '/steps',
      '/connections',
      '/dimensions',
    ]);
  });
});
