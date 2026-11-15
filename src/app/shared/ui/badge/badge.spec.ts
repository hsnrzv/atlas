import { TestBed } from '@angular/core/testing';
import { AtlasDimensionBadge } from './dimension-badge';
import { AtlasStatusBadge } from './status-badge';

describe('Badges', () => {
  it('StatusBadge shows the vocabulary label and the status colours', async () => {
    const fixture = TestBed.createComponent(AtlasStatusBadge);
    fixture.componentRef.setInput('status', 'success');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent?.trim()).toBe('Completed');
    expect(host.style.getPropertyValue('--atlas-badge-foreground')).toBe(
      'var(--color-status-success)',
    );
    expect(host.style.getPropertyValue('--atlas-badge-background')).toBe(
      'var(--color-status-success-tint)',
    );
    expect(host.querySelector('atlas-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('DimensionBadge shows the dimension name and colours', async () => {
    const fixture = TestBed.createComponent(AtlasDimensionBadge);
    fixture.componentRef.setInput('dimension', 'health');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent?.trim()).toBe('Health');
    expect(host.style.getPropertyValue('--atlas-badge-foreground')).toBe(
      'var(--color-dimension-health)',
    );
  });
});
