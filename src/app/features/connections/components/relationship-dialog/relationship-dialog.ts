import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  form,
  pattern,
  submit,
  type FieldTree,
  type ValidationError,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import type { FormSaveError } from '../../../../shared/ui/node-form-dialog/node-form-dialog';

export interface RelationshipDialogData {
  readonly goalTitle: string;
  readonly dimensionLabel: string;
  /** Saves the association; `weight` is a decimal string or `null`. */
  save(weight: string | null): Promise<FormSaveError | null>;
}

interface RelationshipModel {
  weight: string;
}

/** A decimal such as `0.3` or `1`. The allowed range is the backend's rule (R-12, FQ-20), so it is not checked here. */
const DECIMAL = /^\d+(\.\d+)?$/;

/**
 * "Relationship details" before a new connection (owner request 2026-11-16): confirms the Destination → Life
 * Dimension association and takes an optional contribution weight (project-instruction §7). Save creates it.
 */
@Component({
  selector: 'atlas-relationship-dialog',
  imports: [
    FormField,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
  ],
  templateUrl: './relationship-dialog.html',
  styleUrl: './relationship-dialog.scss',
})
export class AtlasRelationshipDialog {
  protected readonly data = inject<RelationshipDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<AtlasRelationshipDialog, boolean>>(MatDialogRef);

  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly model = signal<RelationshipModel>({ weight: '' });
  protected readonly relationship = form(this.model, (path) => {
    pattern(path.weight, DECIMAL, { message: 'Enter the weight as a number, for example 0.3.' });
  });

  protected error(field: FieldTree<string>): string | null {
    const state = field();
    return state.touched() && state.invalid() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.relationship, {
      action: async () => {
        this.saving.set(true);
        const failure = await this.data
          .save(this.model().weight.trim() || null)
          .finally(() => this.saving.set(false));
        if (!failure) {
          this.ref.close(true);
          return undefined;
        }
        this.formError.set(failure.message);
        return this.fieldErrors(failure);
      },
    });
  }

  private fieldErrors(failure: FormSaveError): ValidationError.WithFieldTree[] {
    const message = Object.entries(failure.fieldErrors).find(([name]) =>
      name.includes('weight'),
    )?.[1];
    return message ? [{ fieldTree: this.relationship.weight, kind: 'server', message }] : [];
  }
}

/** Opens the dialog; resolves `true` after the relationship was saved. */
export async function openRelationshipDialog(
  dialog: MatDialog,
  data: RelationshipDialogData,
): Promise<boolean> {
  const ref = dialog.open<AtlasRelationshipDialog, RelationshipDialogData, boolean>(
    AtlasRelationshipDialog,
    {
      data,
      width: 'var(--layout-dialog-width)',
      maxWidth: '100vw',
      autoFocus: 'first-tabbable',
    },
  );
  return (await firstValueFrom(ref.afterClosed())) === true;
}
