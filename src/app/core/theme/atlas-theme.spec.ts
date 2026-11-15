import { TestBed } from '@angular/core/testing';
import { ATLAS_THEME_STORAGE_KEY, AtlasTheme } from './atlas-theme';

type Listener = (event: MediaQueryListEvent) => void;

function mockSystemPreference(dark: boolean) {
  const listeners = new Set<Listener>();
  const media = {
    matches: dark,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  };
  window.matchMedia = vi.fn().mockReturnValue(media);
  return {
    change(next: boolean) {
      media.matches = next;
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
    },
  };
}

function createTheme(): AtlasTheme {
  const theme = TestBed.inject(AtlasTheme);
  TestBed.tick();
  return theme;
}

describe('AtlasTheme', () => {
  const root = document.documentElement;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    delete root.dataset['theme'];
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('follows the system preference when nothing is stored', () => {
    const system = mockSystemPreference(true);
    const theme = createTheme();

    expect(theme.preference()).toBe('system');
    expect(root.dataset['theme']).toBe('dark');

    system.change(false);
    TestBed.tick();
    expect(theme.mode()).toBe('light');
    expect(root.dataset['theme']).toBe('light');
  });

  it('restores an explicit choice and ignores the system preference', () => {
    mockSystemPreference(true);
    localStorage.setItem(ATLAS_THEME_STORAGE_KEY, 'light');

    const theme = createTheme();

    expect(theme.preference()).toBe('light');
    expect(root.dataset['theme']).toBe('light');
  });

  it('stores only explicit choices', () => {
    mockSystemPreference(false);
    const theme = createTheme();

    theme.toggle();
    TestBed.tick();
    expect(root.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(ATLAS_THEME_STORAGE_KEY)).toBe('dark');

    theme.setPreference('system');
    TestBed.tick();
    expect(root.dataset['theme']).toBe('light');
    expect(localStorage.getItem(ATLAS_THEME_STORAGE_KEY)).toBeNull();
  });

  it('ignores unknown stored values', () => {
    mockSystemPreference(false);
    localStorage.setItem(ATLAS_THEME_STORAGE_KEY, 'sepia');

    expect(createTheme().preference()).toBe('system');
  });
});
