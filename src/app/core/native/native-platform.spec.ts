import { TestBed } from '@angular/core/testing';
import { NATIVE_PLATFORM } from './native-platform';

describe('NATIVE_PLATFORM', () => {
  const global = window as { Capacitor?: unknown };

  afterEach(() => delete global.Capacitor);

  it('is null in a browser', () => {
    expect(TestBed.inject(NATIVE_PLATFORM)).toBeNull();
  });

  it('is null for Capacitor running on the web', () => {
    global.Capacitor = { isNativePlatform: () => false, getPlatform: () => 'web' };
    expect(TestBed.inject(NATIVE_PLATFORM)).toBeNull();
  });

  it.each(['ios', 'android'])('reports %s inside the native shell', (platform) => {
    global.Capacitor = { isNativePlatform: () => true, getPlatform: () => platform };
    expect(TestBed.inject(NATIVE_PLATFORM)).toBe(platform);
  });
});
