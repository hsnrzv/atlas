import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AtlasToast } from './atlas-toast';

describe('AtlasToast', () => {
  it('opens a polite snack bar without an action', () => {
    const open = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: MatSnackBar, useValue: { open } }] });
    TestBed.inject(AtlasToast).show('Destination saved');
    expect(open).toHaveBeenCalledWith('Destination saved', undefined, {
      duration: 4000,
      politeness: 'polite',
    });
  });
});
