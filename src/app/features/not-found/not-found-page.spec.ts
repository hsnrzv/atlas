import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('explains the missing page and links back to My Atlas', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toBe('Page not found');
    expect(root.querySelector('h2')?.textContent).toBe('We could not find this page');
    const home = root.querySelector('a');
    expect(home?.textContent?.trim()).toBe('Go to My Atlas');
    expect(home?.getAttribute('href')).toBe('/atlas');
  });
});
