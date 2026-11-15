import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AtlasNodeFormDialog,
  type NodeFormDialogData,
  type NodeFormValue,
} from './node-form-dialog';

describe('AtlasNodeFormDialog', () => {
  const initial: NodeFormValue = {
    nodeType: 'TASK',
    title: '',
    outcome: null,
    description: null,
    dueDate: null,
    prerequisites: [],
  };

  function render(overrides: Partial<NodeFormDialogData> = {}) {
    const close = vi.fn();
    const data: NodeFormDialogData = {
      mode: 'create',
      initial,
      context: 'In Submit application',
      prerequisiteOptions: [{ id: 'review', title: 'Review application checklist' }],
      save: vi.fn(async () => null),
      ...overrides,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(AtlasNodeFormDialog);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const field = host.querySelector<HTMLInputElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    const submitForm = async () => {
      host.querySelector('form')!.dispatchEvent(new Event('submit'));
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
    };
    return { fixture, host, data, close, type, submitForm };
  }

  it('names the dialog after the mode and kind', () => {
    const { host } = render();
    expect(host.querySelector('h2')?.textContent).toBe('Add Step');
    expect(host.textContent).toContain('In Submit application');
    expect(host.textContent).toContain('Ready when · optional');
  });

  it('requires a title and does not save without one', async () => {
    const { host, data, close, submitForm } = render();
    await submitForm();
    expect(data.save).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelector('mat-error')?.textContent).toContain('Enter a title.');
  });

  it('saves trimmed values and closes with true', async () => {
    const { data, close, type, submitForm } = render();
    type('input', '  Request transcripts ');
    type('textarea', 'Transcripts uploaded');
    await submitForm();
    expect(data.save).toHaveBeenCalledWith({
      nodeType: 'TASK',
      title: 'Request transcripts',
      outcome: 'Transcripts uploaded',
      description: null,
      dueDate: null,
      prerequisites: [],
    });
    expect(close).toHaveBeenCalledWith(true);
  });

  it('keeps the dialog open and maps server errors to fields', async () => {
    const { host, close, type, submitForm } = render({
      save: async () => ({
        message: 'Check the highlighted fields.',
        fieldErrors: { title: 'Already used in this Waypoint.' },
      }),
    });
    type('input', 'Duplicate');
    await submitForm();
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Check the highlighted fields.');
    expect(host.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('hides the type when editing', () => {
    const { host } = render({
      mode: 'edit',
      initial: { ...initial, nodeType: 'MILESTONE', title: 'Graduate' },
    });
    expect(host.querySelector('h2')?.textContent).toBe('Edit Waypoint');
    expect(host.querySelectorAll('mat-select')).toHaveLength(2);
    expect(host.querySelector('input')?.value).toBe('Graduate');
  });
});
