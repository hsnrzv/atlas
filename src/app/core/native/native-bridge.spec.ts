import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AtlasTheme } from '../theme/atlas-theme';
import { AtlasNativeBridge, NativePlugins } from './native-bridge';

@Component({ template: '' })
class EmptyPage {}

function fakePlugins() {
  let keyboardShown = () => undefined as void;
  let backButton: (canGoBack: boolean) => void = () => undefined;
  const plugins = {
    setSystemBarsStyle: vi.fn(() => Promise.resolve()),
    hideSplash: vi.fn(() => Promise.resolve()),
    minimizeApp: vi.fn(() => Promise.resolve()),
    onKeyboardShown: vi.fn((listener: () => void) => (keyboardShown = listener)),
    onBackButton: vi.fn((listener: (canGoBack: boolean) => void) => (backButton = listener)),
  } satisfies NativePlugins;
  return {
    plugins,
    showKeyboard: () => keyboardShown(),
    pressBack: (canGoBack: boolean) => backButton(canGoBack),
  };
}

describe('AtlasNativeBridge', () => {
  let bridge: AtlasNativeBridge;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: EmptyPage }])],
    });
    bridge = TestBed.inject(AtlasNativeBridge);
  });

  afterEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
  });

  it('styles the system bars for the current theme and follows changes', () => {
    const { plugins } = fakePlugins();
    const theme = TestBed.inject(AtlasTheme);
    theme.setPreference('dark');

    bridge.connect(plugins);
    TestBed.tick();
    expect(plugins.setSystemBarsStyle).toHaveBeenLastCalledWith('dark');

    theme.setPreference('light');
    TestBed.tick();
    expect(plugins.setSystemBarsStyle).toHaveBeenLastCalledWith('light');
  });

  it('hides the splash once the first navigation has rendered', async () => {
    const { plugins } = fakePlugins();
    bridge.connect(plugins);
    TestBed.tick();
    expect(plugins.hideSplash).not.toHaveBeenCalled();

    await TestBed.inject(Router).navigateByUrl('/atlas');
    TestBed.tick();
    expect(plugins.hideSplash).toHaveBeenCalledTimes(1);
  });

  it('hides the splash at once when the first navigation finished before it connected', async () => {
    const { plugins } = fakePlugins();
    await TestBed.inject(Router).navigateByUrl('/atlas');

    bridge.connect(plugins);
    TestBed.tick();
    expect(plugins.hideSplash).toHaveBeenCalledTimes(1);
  });

  it('scrolls the focused field into view when the keyboard opens', () => {
    const { plugins, showKeyboard } = fakePlugins();
    bridge.connect(plugins);
    const field = document.createElement('input');
    field.scrollIntoView = vi.fn();
    document.body.append(field);
    field.focus();

    showKeyboard();
    expect(field.scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
  });

  it('closes the top overlay with Escape before going back', () => {
    const { plugins, pressBack } = fakePlugins();
    const back = vi.spyOn(TestBed.inject(Location), 'back');
    bridge.connect(plugins);
    const pane = document.createElement('div');
    pane.className = 'cdk-overlay-pane';
    pane.innerHTML = '<div role="dialog"><button type="button">Cancel</button></div>';
    document.body.append(pane);
    pane.querySelector('button')!.focus();
    const keys: KeyboardEvent[] = [];
    document.body.addEventListener('keydown', (event) => keys.push(event));

    pressBack(true);
    expect(keys.map((event) => [event.key, event.keyCode])).toEqual([['Escape', 27]]);
    expect(back).not.toHaveBeenCalled();
  });

  it('ignores toasts and goes back through the history', () => {
    const { plugins, pressBack } = fakePlugins();
    const back = vi.spyOn(TestBed.inject(Location), 'back').mockImplementation(() => undefined);
    bridge.connect(plugins);
    const pane = document.createElement('div');
    pane.className = 'cdk-overlay-pane';
    pane.innerHTML = '<div aria-live="polite">Saved</div>';
    document.body.append(pane);

    pressBack(true);
    expect(back).toHaveBeenCalledTimes(1);
    expect(plugins.minimizeApp).not.toHaveBeenCalled();
  });

  it('leaves the app when there is no history', () => {
    const { plugins, pressBack } = fakePlugins();
    bridge.connect(plugins);

    pressBack(false);
    expect(plugins.minimizeApp).toHaveBeenCalledTimes(1);
  });

  it('connects only once', () => {
    const { plugins } = fakePlugins();
    bridge.connect(plugins);
    bridge.connect(plugins);
    expect(plugins.onBackButton).toHaveBeenCalledTimes(1);
  });

  it('logs a failed native call instead of throwing', async () => {
    const { plugins, pressBack } = fakePlugins();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    plugins.minimizeApp.mockRejectedValueOnce(new Error('unavailable'));
    bridge.connect(plugins);

    pressBack(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(warn).toHaveBeenCalledWith('A native shell call failed.', expect.any(Error));
  });
});
