import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AtlasNotesPanel, type NotesHandler, type NoteVm } from './notes-panel';

describe('AtlasNotesPanel', () => {
  const note: NoteVm = {
    id: 'n1',
    body: '<b>Ask</b> for references\nby Friday',
    updated: { datetime: '2026-11-12', text: '12 Nov 2026' },
  };

  function render(notes: readonly NoteVm[], handler: Partial<NotesHandler> = {}) {
    const full: NotesHandler = {
      add: vi.fn(async () => null),
      update: vi.fn(async () => null),
      remove: vi.fn(async () => null),
      ...handler,
    };
    const fixture = TestBed.createComponent(AtlasNotesPanel);
    fixture.componentRef.setInput('notes', notes);
    fixture.componentRef.setInput('handler', full);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement, handler: full };
  }

  async function settle(fixture: { detectChanges(): void }): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  it('renders notes as plain text and an empty message otherwise', () => {
    const { host } = render([note]);
    const body = host.querySelector('.body')!;
    expect(body.textContent).toBe(note.body);
    expect(body.querySelector('b')).toBeNull();
    expect(render([]).host.textContent).toContain('No notes or resources provided.');
  });

  it('adds a trimmed note and clears the field', async () => {
    const { fixture, host, handler } = render([]);
    const textarea = host.querySelector<HTMLTextAreaElement>('.add textarea')!;
    textarea.value = '  Book a campus visit  ';
    textarea.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form.add')!.dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(handler.add).toHaveBeenCalledWith('Book a campus visit');
    expect(textarea.value).toBe('');
  });

  it('does not submit an empty note and shows the error', async () => {
    const { fixture, host, handler } = render([]);
    host.querySelector<HTMLFormElement>('form.add')!.dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(handler.add).not.toHaveBeenCalled();
    expect(host.querySelector('mat-error')?.textContent).toContain('Write a note first.');
  });

  it('shows a failed write as an alert', async () => {
    const { fixture, host } = render([], { add: async () => 'Could not save.' });
    const textarea = host.querySelector<HTMLTextAreaElement>('.add textarea')!;
    textarea.value = 'Note';
    textarea.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form.add')!.dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Could not save.');
    expect(textarea.value).toBe('Note');
  });

  it('edits a note in place', async () => {
    const { fixture, host, handler } = render([note]);
    host.querySelector<HTMLButtonElement>('.note button')!.click();
    fixture.detectChanges();
    const textarea = host.querySelector<HTMLTextAreaElement>('.edit textarea')!;
    expect(textarea.value).toBe(note.body);
    textarea.value = 'Updated';
    textarea.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form.edit')!.dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(handler.update).toHaveBeenCalledWith('n1', 'Updated');
    expect(host.querySelector('form.edit')).toBeNull();
  });

  it('deletes only after confirmation', async () => {
    const { fixture, host, handler } = render([note]);
    const open = vi
      .spyOn(TestBed.inject(MatDialog), 'open')
      .mockReturnValueOnce({ afterClosed: () => of(false) } as never)
      .mockReturnValueOnce({ afterClosed: () => of(true) } as never);
    const remove = () => host.querySelectorAll<HTMLButtonElement>('.note button')[1].click();
    remove();
    await settle(fixture);
    expect(handler.remove).not.toHaveBeenCalled();
    remove();
    await settle(fixture);
    expect(open).toHaveBeenCalledTimes(2);
    expect(handler.remove).toHaveBeenCalledWith('n1');
  });
});
