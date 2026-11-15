import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { openConfirm } from './confirm-dialog';

describe('openConfirm', () => {
  function dialogButtons(): HTMLButtonElement[] {
    return [...document.querySelectorAll<HTMLButtonElement>('atlas-confirm-dialog button')];
  }

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('shows the copy and resolves true on confirm', async () => {
    const result = openConfirm(TestBed.inject(MatDialog), {
      title: 'Delete Destination?',
      message: 'This removes its Waypoints and Steps.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    await settle();
    expect(document.querySelector('atlas-confirm-dialog h2')?.textContent).toBe(
      'Delete Destination?',
    );
    const [cancel, confirm] = dialogButtons();
    expect(cancel.textContent?.trim()).toBe('Cancel');
    expect(confirm.classList).toContain('is-destructive');
    confirm.click();
    await settle();
    expect(await result).toBe(true);
  });

  it('resolves false on cancel', async () => {
    const result = openConfirm(TestBed.inject(MatDialog), {
      title: 'Archive?',
      message: 'You can restore it later.',
      confirmLabel: 'Archive',
    });
    await settle();
    dialogButtons()[0].click();
    await settle();
    expect(await result).toBe(false);
  });
});
