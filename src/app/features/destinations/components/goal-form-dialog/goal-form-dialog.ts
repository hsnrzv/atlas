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
import type { GoalStatus } from '../../../../core/models/goal';
import type { GoalDraft } from '../../../../core/models/goal-commands';
import type { IkigaiAreaKey } from '../../../../core/models/life-dimension';
import {
  fromPlannedDate,
  plannedDateRules,
  toPlannedDate,
  type PlannedDateModel,
} from '../../../../shared/forms/planned-date';
import type { FormSaveError } from '../../../../shared/ui/node-form-dialog/node-form-dialog';
import { AtlasPlannedDateFields } from '../../../../shared/ui/planned-date-fields/planned-date-fields';
import { LIFE_DIMENSIONS } from '../../../../shared/design-system/life-dimensions';
import { GOAL_STATUS_OPTIONS } from '../../../../shared/utils/plan-format';

export interface GoalFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly initial: GoalDraft;
  /** Offered as "Use sample details" while creating, in sample mode only. */
  readonly sample: GoalDraft | null;
  save(draft: GoalDraft): Promise<FormSaveError | null>;
}

interface GoalFormModel {
  title: string;
  outcome: string;
  primaryAreaKey: IkigaiAreaKey | '';
  status: GoalStatus;
  target: PlannedDateModel;
  description: string;
  reward: string;
}

const TITLE_MAX = 200;
const TEXT_MAX = 2000;
const text = (value: string): string | null => value.trim() || null;

export const EMPTY_GOAL_DRAFT: GoalDraft = {
  title: '',
  outcome: null,
  description: null,
  primaryAreaKey: 'CAREER',
  status: 'ACTIVE',
  targetDate: null,
  reward: null,
};

function toModel(draft: GoalDraft, mode: GoalFormDialogData['mode']): GoalFormModel {
  return {
    title: draft.title,
    outcome: draft.outcome ?? '',
    primaryAreaKey: mode === 'create' && !draft.title ? '' : draft.primaryAreaKey,
    status: draft.status,
    target: fromPlannedDate(draft.targetDate),
    description: draft.description ?? '',
    reward: draft.reward ?? '',
  };
}

/**
 * Create or edit a Destination (F2-6, Figma page 06 "Create destination"): Signal Forms on Material fields
 * (ADR-0009). Financial values and time commitments stay out of the form until the backend owns them (R-12).
 */
@Component({
  selector: 'atlas-goal-form-dialog',
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
  templateUrl: './goal-form-dialog.html',
  styleUrl: './goal-form-dialog.scss',
})
export class AtlasGoalFormDialog {
  protected readonly data = inject<GoalFormDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<AtlasGoalFormDialog, boolean>>(MatDialogRef);

  protected readonly dimensionOptions = LIFE_DIMENSIONS.map((dimension) => ({
    value: dimension.apiKey as IkigaiAreaKey,
    label: dimension.label,
  }));
  protected readonly statusOptions = GOAL_STATUS_OPTIONS;
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly model = signal<GoalFormModel>(toModel(this.data.initial, this.data.mode));
  protected readonly goal = form(this.model, (path) => {
    required(path.title, { message: 'Enter a name for this Destination.' });
    maxLength(path.title, TITLE_MAX, { message: `Keep the name under ${TITLE_MAX} characters.` });
    required(path.primaryAreaKey, { message: 'Choose a Life Dimension.' });
    maxLength(path.outcome, TEXT_MAX, { message: `Keep this under ${TEXT_MAX} characters.` });
    maxLength(path.description, TEXT_MAX, { message: `Keep this under ${TEXT_MAX} characters.` });
    maxLength(path.reward, TITLE_MAX, {
      message: `Keep the reward under ${TITLE_MAX} characters.`,
    });
    plannedDateRules(path.target);
  });

  protected heading(): string {
    return this.data.mode === 'create' ? 'Create destination' : 'Edit destination';
  }

  protected useSample(): void {
    if (this.data.sample) {
      this.goal().reset(toModel(this.data.sample, 'edit'));
      this.formError.set(null);
    }
  }

  protected error(field: FieldTree<string>): string | null {
    const state = field();
    return state.touched() && state.invalid() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.goal, {
      action: async () => {
        this.saving.set(true);
        const value = this.model();
        const failure = await this.data
          .save({
            title: value.title.trim(),
            outcome: text(value.outcome),
            description: text(value.description),
            primaryAreaKey: value.primaryAreaKey as IkigaiAreaKey,
            status: value.status,
            targetDate: toPlannedDate(value.target),
            reward: text(value.reward),
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
      title: this.goal.title,
      outcome: this.goal.outcome,
      description: this.goal.description,
      primaryAreaKey: this.goal.primaryAreaKey,
      targetDate: this.goal.target.date,
      reward: this.goal.reward,
    };
    return Object.entries(failure.fieldErrors)
      .filter(([name]) => fields[name])
      .map(([name, message]) => ({ fieldTree: fields[name], kind: 'server', message }));
  }
}

/** Opens the form; resolves `true` after a successful save. */
export async function openGoalForm(dialog: MatDialog, data: GoalFormDialogData): Promise<boolean> {
  const ref = dialog.open<AtlasGoalFormDialog, GoalFormDialogData, boolean>(AtlasGoalFormDialog, {
    data,
    width: 'var(--layout-dialog-width)',
    maxWidth: '100vw',
    autoFocus: 'first-tabbable',
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
