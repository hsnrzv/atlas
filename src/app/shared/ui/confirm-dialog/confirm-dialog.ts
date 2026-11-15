import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

export interface ConfirmDialogData {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  /** Styles the confirm action as destructive. Cancel stays the initial focus either way. */
  readonly destructive?: boolean;
}

/** Confirmation before an irreversible or disruptive action (F3-1). Focus starts on Cancel. */
@Component({
  selector: 'atlas-confirm-dialog',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class AtlasConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

/** Opens the confirmation and resolves `true` only when the user confirms. */
export async function openConfirm(dialog: MatDialog, data: ConfirmDialogData): Promise<boolean> {
  const ref = dialog.open<AtlasConfirmDialog, ConfirmDialogData, boolean>(AtlasConfirmDialog, {
    data,
    role: 'alertdialog',
    autoFocus: 'dialog',
    maxWidth: 'var(--layout-dialog-width)',
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
