import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ATLAS_COMPANION_STORAGE_KEY } from '../../core/companion/companion-preferences.store';
import { CompanionSettingsPage } from './companion-settings-page';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(CompanionSettingsPage);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('CompanionSettingsPage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('offers on, muted and off with the current choice', async () => {
    const { root } = await render();
    expect(root.querySelector('h1')?.textContent).toContain('Your companion, your choice');
    expect(
      [...root.querySelectorAll('.option-label')].map((label) => label.textContent?.trim()),
    ).toEqual(['Show companion', 'Mute', 'Disable']);
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Show companion');
  });

  it('saves a new choice right away', async () => {
    const { fixture, root } = await render();
    root.querySelector<HTMLInputElement>('[data-mode="off"] input')!.click();
    await fixture.whenStable();
    expect(localStorage.getItem(ATLAS_COMPANION_STORAGE_KEY)).toBe('off');
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Disable');
  });
});
