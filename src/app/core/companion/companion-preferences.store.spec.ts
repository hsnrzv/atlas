import { TestBed } from '@angular/core/testing';
import {
  ATLAS_COMPANION_STORAGE_KEY,
  CompanionPreferencesStore,
} from './companion-preferences.store';

describe('CompanionPreferencesStore', () => {
  afterEach(() => localStorage.clear());

  it('defaults to on and keeps Mute and Disable in localStorage', () => {
    const store = TestBed.inject(CompanionPreferencesStore);
    expect(store.mode()).toBe('on');
    store.setMode('muted');
    expect(localStorage.getItem(ATLAS_COMPANION_STORAGE_KEY)).toBe('muted');
    store.setMode('on');
    expect(localStorage.getItem(ATLAS_COMPANION_STORAGE_KEY)).toBeNull();
  });

  it('reads a stored preference and ignores unknown values', () => {
    localStorage.setItem(ATLAS_COMPANION_STORAGE_KEY, 'off');
    expect(TestBed.inject(CompanionPreferencesStore).mode()).toBe('off');
    TestBed.resetTestingModule();
    localStorage.setItem(ATLAS_COMPANION_STORAGE_KEY, 'loud');
    expect(TestBed.inject(CompanionPreferencesStore).mode()).toBe('on');
  });

  it('hides a dismissed appearance for the session and everything when off', () => {
    const store = TestBed.inject(CompanionPreferencesStore);
    expect(store.shows('next-step')).toBe(true);
    store.dismiss('next-step');
    expect(store.shows('next-step')).toBe(false);
    expect(store.shows('waypoint-achieved')).toBe(true);
    store.setMode('off');
    expect(store.shows('waypoint-achieved')).toBe(false);
  });
});
