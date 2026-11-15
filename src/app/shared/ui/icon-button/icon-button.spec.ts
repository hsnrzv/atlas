import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasIconButton } from './icon-button';

@Component({
  imports: [AtlasIconButton],
  template: `<button
    atlas-icon-button
    icon="settings"
    aria-label="Settings"
    size="compact"
  ></button>`,
})
class Host {}

describe('AtlasIconButton', () => {
  it('names the button with its label and hides the icon', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Settings');
    expect(button.classList).toContain('is-compact');
    expect(button.querySelector('atlas-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
