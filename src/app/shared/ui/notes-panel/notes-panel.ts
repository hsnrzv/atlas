import { Component, inject, input, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { openConfirm } from '../confirm-dialog/confirm-dialog';

export interface NoteVm {
  readonly id: string;
  readonly body: string;
  readonly updated: { readonly datetime: string; readonly text: string };
}

/** Writes behind the panel; each resolves `null` on success or a message to show. */
export interface NotesHandler {
  add(body: string): Promise<string | null>;
  update(noteId: string, body: string): Promise<string | null>;
  remove(noteId: string): Promise<string | null>;
}

export const NOTE_MAX_LENGTH = 10000;

/**
 * Notes for a Destination or Waypoint (F3-3). Notes are plain text (D13): rendered with interpolation and
 * `white-space: pre-wrap`, never as HTML.
 */
@Component({
  selector: 'atlas-notes-panel',
  imports: [FormField, MatButton, MatError, MatFormField, MatInput, MatLabel],
  templateUrl: './notes-panel.html',
  styleUrl: './notes-panel.scss',
})
export class AtlasNotesPanel {
  readonly notes = input.required<readonly NoteVm[]>();
  readonly handler = input.required<NotesHandler>();
  readonly heading = input('Notes and resources');
  readonly emptyText = input('No notes or resources provided.');
  readonly loading = input(false);

  private readonly dialog = inject(MatDialog);
  protected readonly headingId = `atlas-notes-${nextId++}`;
  protected readonly busy = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);

  protected readonly draftModel = signal({ body: '' });
  protected readonly draft = form(this.draftModel, (path) => {
    required(path.body, { message: 'Write a note first.' });
    maxLength(path.body, NOTE_MAX_LENGTH, { message: 'Keep a note under 10,000 characters.' });
  });
  protected readonly editModel = signal({ body: '' });
  protected readonly edit = form(this.editModel, (path) => {
    required(path.body, { message: 'A note cannot be empty. Delete it instead.' });
    maxLength(path.body, NOTE_MAX_LENGTH, { message: 'Keep a note under 10,000 characters.' });
  });

  protected async addNote(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.draft, {
      action: async () => {
        const error = await this.run(() => this.handler().add(this.draftModel().body.trim()));
        if (!error) {
          this.draft().reset({ body: '' });
        }
        return undefined;
      },
    });
  }

  protected startEdit(note: NoteVm): void {
    this.edit().reset({ body: note.body });
    this.editingId.set(note.id);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected async saveEdit(event: Event, note: NoteVm): Promise<void> {
    event.preventDefault();
    await submit(this.edit, {
      action: async () => {
        const error = await this.run(() =>
          this.handler().update(note.id, this.editModel().body.trim()),
        );
        if (!error) {
          this.editingId.set(null);
        }
        return undefined;
      },
    });
  }

  protected async removeNote(note: NoteVm): Promise<void> {
    const confirmed = await openConfirm(this.dialog, {
      title: 'Delete note?',
      message: 'This note will be removed. This cannot be undone.',
      confirmLabel: 'Delete note',
      destructive: true,
    });
    if (confirmed) {
      await this.run(() => this.handler().remove(note.id));
    }
  }

  private async run(action: () => Promise<string | null>): Promise<string | null> {
    this.busy.set(true);
    this.message.set(null);
    try {
      const error = await action();
      this.message.set(error);
      return error;
    } finally {
      this.busy.set(false);
    }
  }
}

let nextId = 0;
