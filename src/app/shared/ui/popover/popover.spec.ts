import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasPopover, AtlasPopoverTrigger } from './popover';

@Component({
  imports: [AtlasPopover, AtlasPopoverTrigger],
  template: `
    <button [atlasPopoverTrigger]="info">About progress</button>
    <atlas-popover #info title="How progress works">
      Progress comes from your completed Waypoints. <a href="/help">Learn more</a>
    </atlas-popover>
  `,
})
class Host {}

describe('AtlasPopover', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, trigger, panel: () => document.querySelector('.atlas-popover-panel') };
  }

  it('opens a labelled dialog from its trigger', async () => {
    const { fixture, trigger, panel } = await render();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.getAttribute('role')).toBe('dialog');
    const titleId = panel()?.getAttribute('aria-labelledby');
    expect(document.getElementById(titleId!)?.textContent).toBe('How progress works');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()?.id);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { fixture, trigger, panel } = await render();
    trigger.click();
    await fixture.whenStable();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
