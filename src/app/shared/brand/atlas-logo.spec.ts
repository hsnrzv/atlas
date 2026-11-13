import { TestBed } from '@angular/core/testing';
import { AtlasLogo } from './atlas-logo';

describe('AtlasLogo', () => {
  it('is announced once as the product name, with the wordmark hidden from assistive technology', async () => {
    const fixture = TestBed.createComponent(AtlasLogo);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('IKIGAI ATLAS');
    expect(host.querySelector('.wordmark')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelectorAll('circle')).toHaveLength(4);
  });

  it('can be marked decorative', async () => {
    const fixture = TestBed.createComponent(AtlasLogo);
    fixture.componentRef.setInput('decorative', true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.hasAttribute('aria-label')).toBe(false);
  });
});
