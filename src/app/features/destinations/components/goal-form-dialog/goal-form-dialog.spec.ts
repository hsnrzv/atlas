import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { GoalDraft } from '../../../../core/models/goal-commands';
import { AtlasGoalFormDialog, EMPTY_GOAL_DRAFT, type GoalFormDialogData } from './goal-form-dialog';

const SAMPLE: GoalDraft = {
  title: 'Earn a master’s degree',
  outcome: 'Graduate with a master’s degree',
  description: 'Grow into research work',
  primaryAreaKey: 'CAREER',
  status: 'ACTIVE',
  targetDate: { date: '2030-01-01', precision: 'APPROXIMATE' },
  reward: 'Graduation celebration',
};

describe('AtlasGoalFormDialog', () => {
  function render(overrides: Partial<GoalFormDialogData> = {}) {
    const close = vi.fn();
    const data: GoalFormDialogData = {
      mode: 'create',
      initial: EMPTY_GOAL_DRAFT,
      sample: null,
      save: vi.fn(async () => null),
      ...overrides,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(AtlasGoalFormDialog);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const submitForm = async () => {
      host.querySelector('form')!.dispatchEvent(new Event('submit'));
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
    };
    const button = (label: string) =>
      [...host.querySelectorAll('button')].find((item) => item.textContent?.trim() === label)!;
    return { fixture, host, data, close, submitForm, button };
  }

  it('asks for a name and a Life Dimension before saving', async () => {
    const { host, data, close, submitForm } = render();
    expect(host.querySelector('h2')?.textContent).toBe('Create destination');
    await submitForm();
    expect(data.save).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    const errors = [...host.querySelectorAll('mat-error')].map((error) => error.textContent);
    expect(errors).toContain('Enter a name for this Destination.');
    expect(errors).toContain('Choose a Life Dimension.');
  });

  it('offers sample details only in sample mode and saves them', async () => {
    expect(render().host.textContent).not.toContain('Use sample details');
    TestBed.resetTestingModule();
    const { fixture, data, close, submitForm, button } = render({ sample: SAMPLE });
    button('Use sample details').click();
    fixture.detectChanges();
    await submitForm();
    expect(data.save).toHaveBeenCalledWith(SAMPLE);
    expect(close).toHaveBeenCalledWith(true);
  });

  it('keeps the form open and shows server field errors', async () => {
    const save = vi.fn(async () => ({
      message: 'Check the highlighted fields.',
      fieldErrors: { title: 'A Destination with this name exists.' },
    }));
    const { fixture, host, close, submitForm } = render({ mode: 'edit', initial: SAMPLE, save });
    expect(host.querySelector('h2')?.textContent).toBe('Edit destination');
    await submitForm();
    fixture.detectChanges();
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Check the highlighted fields.',
    );
    expect(host.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('notes that money and time commitments are not part of the form', () => {
    expect(render().host.textContent).toContain(
      'Financial values and time commitments are not set here yet.',
    );
  });
});
