import { TestBed } from '@angular/core/testing';
import { AtlasDimensionBadge } from './dimension-badge';

describe('AtlasDimensionBadge', () => {
  it('shows the dimension name and colours', async () => {
    const fixture = TestBed.createComponent(AtlasDimensionBadge);
    fixture.componentRef.setInput('dimension', 'health');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent?.trim()).toBe('Health');
    expect(host.style.getPropertyValue('--atlas-badge-foreground')).toBe(
      'var(--color-dimension-health)',
    );
    expect(host.querySelector('atlas-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
