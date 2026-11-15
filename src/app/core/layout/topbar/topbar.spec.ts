import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideRouter } from '@angular/router';
import { AtlasTheme } from '../../theme/atlas-theme';
import { AtlasTopbar } from './topbar';

describe('AtlasTopbar', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('offers account links and the appearance choice in the profile menu', async () => {
    const fixture = TestBed.createComponent(AtlasTopbar);
    const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    await fixture.whenStable();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(trigger.getAttribute('aria-label')).toBe('Account and appearance');

    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const items = await menu.getItems();
    const texts = await Promise.all(items.map((item) => item.getText()));
    expect(texts).toEqual(['Settings', 'Profile', 'Help', 'Match device', 'Light', 'Dark']);

    const radios = document.querySelectorAll('[role="menuitemradio"]');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');

    await items[5].click();
    expect(TestBed.inject(AtlasTheme).preference()).toBe('dark');
  });

  it('shows the symbol only when asked', async () => {
    const fixture = TestBed.createComponent(AtlasTopbar);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.brand')).toBeNull();
    fixture.componentRef.setInput('showBrand', true);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.brand')).not.toBeNull();
  });
});
