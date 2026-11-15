import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  required,
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
import { MatOption, MatSelect } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import type { NodeId, NodeType } from '../../../core/models/goal-node';
import type { PlannedDate } from '../../../core/models/planned-date';
import {
  fromPlannedDate,
  plannedDateRules,
  toPlannedDate,
  type PlannedDateModel,
} from '../../forms/planned-date';
import { AtlasPlannedDateFields } from '../planned-date-fields/planned-date-fields';

export type NodeFormType = Extract<NodeType, 'MILESTONE' | 'TASK'>;

export interface NodeFormValue {
  readonly nodeType: NodeFormType;
  readonly title: string;
  readonly outcome: string | null;
  readonly description: string | null;
  readonly dueDate: PlannedDate | null;
  readonly prerequisites: readonly NodeId[];
}

/** A failed save: a message for the form and optional per-field messages (Problem Details `errors[]`). */
export interface FormSaveError {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

export interface NodeFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly initial: NodeFormValue;
  /** Where the node lives, e.g. "In Submit application". */
  readonly context: string;
  /** Same-Destination nodes it may wait for (never itself or its descendants). */
  readonly prerequisiteOptions: readonly { readonly id: NodeId; readonly title: string }[];
  save(value: NodeFormValue): Promise<FormSaveError | null>;
}

interface NodeFormModel {
  nodeType: NodeFormType;
  title: string;
  outcome: string;
  description: string;
  due: PlannedDateModel;
  prerequisites: string[];
}

const TITLE_MAX = 200;
const TEXT_MAX = 2000;
const text = (value: string): string | null => value.trim() || null;

/**
 * Create or edit a Waypoint or Step (F3-2): Signal Forms on Material fields (ADR-0009). Server field errors land on
 * their field; anything else shows above the actions. The dialog closes with `true` only after a successful save.
 */
@Component({
  selector: 'atlas-node-form-dialog',
  imports: [
    AtlasPlannedDateFields,
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
    MatOption,
    MatSelect,
  ],
  templateUrl: './node-form-dialog.html',
  styleUrl: './node-form-dialog.scss',
})
export class AtlasNodeFormDialog {
  protected readonly data = inject<NodeFormDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<AtlasNodeFormDialog, boolean>>(MatDialogRef);

  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly model = signal<NodeFormModel>({
    nodeType: this.data.initial.nodeType,
    title: this.data.initial.title,
    outcome: this.data.initial.outcome ?? '',
    description: this.data.initial.description ?? '',
    due: fromPlannedDate(this.data.initial.dueDate),
    prerequisites: [...this.data.initial.prerequisites],
  });
  protected readonly node = form(this.model, (path) => {
    required(path.title, { message: 'Enter a title.' });
    maxLength(path.title, TITLE_MAX, { message: `Keep the title under ${TITLE_MAX} characters.` });
    maxLength(path.outcome, TEXT_MAX, { message: `Keep this under ${TEXT_MAX} characters.` });
    maxLength(path.description, TEXT_MAX, { message: `Keep this under ${TEXT_MAX} characters.` });
    plannedDateRules(path.due);
  });

  protected kind(): string {
    return this.model().nodeType === 'TASK' ? 'Step' : 'Waypoint';
  }

  protected heading(): string {
    return `${this.data.mode === 'create' ? 'Add' : 'Edit'} ${this.kind()}`;
  }

  protected error(field: FieldTree<string>): string | null {
    const state = field();
    return state.touched() && state.invalid() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.node, {
      action: async () => {
        this.saving.set(true);
        const value = this.model();
        const failure = await this.data
          .save({
            nodeType: value.nodeType,
            title: value.title.trim(),
            outcome: text(value.outcome),
            description: text(value.description),
            dueDate: toPlannedDate(value.due),
            prerequisites: value.prerequisites,
          })
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
    const fields: Record<string, FieldTree<unknown>> = {
      title: this.node.title,
      outcome: this.node.outcome,
      description: this.node.description,
      dueDate: this.node.due.date,
    };
    return Object.entries(failure.fieldErrors)
      .filter(([name]) => fields[name])
      .map(([name, message]) => ({ fieldTree: fields[name], kind: 'server', message }));
  }
}

/** Opens the form; resolves `true` after a successful save. */
export async function openNodeForm(dialog: MatDialog, data: NodeFormDialogData): Promise<boolean> {
  const ref = dialog.open<AtlasNodeFormDialog, NodeFormDialogData, boolean>(AtlasNodeFormDialog, {
    data,
    width: 'var(--layout-dialog-width)',
    maxWidth: '100vw',
    autoFocus: 'first-tabbable',
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
