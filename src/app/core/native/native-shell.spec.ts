import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtlasNativeBridge } from './native-bridge';
import { NATIVE_PLATFORM } from './native-platform';
import { provideNativeShell } from './native-shell';

describe('provideNativeShell', () => {
  it('does nothing in a browser', async () => {
    const connect = vi.spyOn(AtlasNativeBridge.prototype, 'connect');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNativeShell(),
        { provide: NATIVE_PLATFORM, useValue: null },
      ],
    });

    await TestBed.inject(ApplicationInitStatus).donePromise;
    await new Promise((resolve) => setTimeout(resolve));
    expect(connect).not.toHaveBeenCalled();
  });
});
