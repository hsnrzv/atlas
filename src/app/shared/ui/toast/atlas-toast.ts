import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Short confirmations such as "Saved" (F3-1). Announced politely; never the only record of an error. */
@Injectable({ providedIn: 'root' })
export class AtlasToast {
  private readonly snackBar = inject(MatSnackBar);

  show(message: string): void {
    this.snackBar.open(message, undefined, { duration: 4000, politeness: 'polite' });
  }
}
