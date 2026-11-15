import { TestBed } from '@angular/core/testing';
import { AtlasStatusBadge } from './status-badge';

describe('AtlasStatusBadge', () => {
  it('shows the vocabulary label and the status colours', async () => {
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

  it('accepts a label override', async () => {
    const fixture = TestBed.createComponent(AtlasStatusBadge);
    fixture.componentRef.setInput('status', 'not-started');
    fixture.componentRef.setInput('label', 'Draft');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Draft');
  });
});
