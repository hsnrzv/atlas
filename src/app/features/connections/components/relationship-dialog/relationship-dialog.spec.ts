import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AtlasRelationshipDialog, type RelationshipDialogData } from './relationship-dialog';

describe('AtlasRelationshipDialog', () => {
  function render(save: RelationshipDialogData['save'] = vi.fn(async () => null)) {
    const close = vi.fn();
    const data: RelationshipDialogData = {
      goalTitle: 'Gym session',
      dimensionLabel: 'Finance',
      save,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(AtlasRelationshipDialog);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input')!;
    const type = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    };
    const submitForm = async () => {
      host.querySelector('form')!.dispatchEvent(new Event('submit'));
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
    };
    return { host, data, close, type, submitForm };
  }

  it('shows the relationship and saves it without a weight', async () => {
    const { host, data, close, submitForm } = render();
    expect(host.querySelector('h2')?.textContent).toBe('Relationship details');
    expect(host.textContent).toContain('Gym session → Finance');
    expect(host.textContent).toContain('Secondary assignment · association');
    await submitForm();
    expect(data.save).toHaveBeenCalledWith(null);
    expect(close).toHaveBeenCalledWith(true);
  });

  it('checks the weight format and saves a decimal weight', async () => {
    const { host, data, close, type, submitForm } = render();
    type('a lot');
    await submitForm();
    expect(data.save).not.toHaveBeenCalled();
    expect(host.querySelector('mat-error')?.textContent).toContain('Enter the weight as a number');
    type('0.3');
    await submitForm();
    expect(data.save).toHaveBeenCalledWith('0.3');
    expect(close).toHaveBeenCalledWith(true);
  });

  it('keeps the dialog open and shows the backend message when saving fails', async () => {
    const { host, close, submitForm } = render(async () => ({
      message: 'Could not save.',
      fieldErrors: { 'secondaryAreas[0].weight': 'Use a weight between 0 and 1.' },
    }));
    await submitForm();
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Could not save.');
  });
});
