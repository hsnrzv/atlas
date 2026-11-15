import { A11yModule } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, Directive, ElementRef, inject, input, signal } from '@angular/core';

let nextId = 0;

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
];

/**
 * Non-modal explanation panel (Figma Atlas/V3/Popover 152:6988). Opened by `[atlasPopoverTrigger]`; Escape or a
 * click outside closes it and focus returns to the trigger.
 */
@Component({
  selector: 'atlas-popover',
  imports: [A11yModule, CdkConnectedOverlay],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
})
export class AtlasPopover {
  readonly title = input.required<string>();

  readonly id = `atlas-popover-${nextId++}`;
  readonly open = signal(false);
  protected readonly origin = signal<ElementRef<HTMLElement> | null>(null);
  protected readonly positions = POSITIONS;

  toggle(origin: ElementRef<HTMLElement>): void {
    if (this.open()) {
      this.close();
    } else {
      this.origin.set(origin);
      this.open.set(true);
    }
  }

  close(restoreFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (restoreFocus) {
      this.origin()?.nativeElement.focus();
    }
  }

  protected onOutsideClick(event: MouseEvent): void {
    // The trigger toggles on its own click; closing here too would reopen it.
    if (!this.origin()?.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}

/** Opens an `<atlas-popover>` from a button: `<button [atlasPopoverTrigger]="info">`. */
@Directive({
  selector: 'button[atlasPopoverTrigger]',
  host: {
    type: 'button',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'atlasPopoverTrigger().open()',
    '[attr.aria-controls]': 'atlasPopoverTrigger().open() ? atlasPopoverTrigger().id : null',
    '(click)': 'atlasPopoverTrigger().toggle(elementRef)',
  },
})
export class AtlasPopoverTrigger {
  readonly atlasPopoverTrigger = input.required<AtlasPopover>();

  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
