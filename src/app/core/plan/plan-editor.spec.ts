import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { from, of } from 'rxjs';
import { GoalPlanStore } from '../data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  SAMPLE_NODE_IDS as N,
} from '../data-access/testing/plan-testing';
import { findNode } from '../models/goal-tree';
import type { NodeFormDialogData } from '../../shared/ui/node-form-dialog/node-form-dialog';
import type { ConfirmDialogData } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { PlanEditor } from './plan-editor';

describe('PlanEditor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  let opened: (NodeFormDialogData | ConfirmDialogData)[];
  let confirm: boolean;

  async function setup() {
    opened = [];
    confirm = true;
    const dialog = {
      // Plays the dialog: a form saves its initial values (with a new title), a confirmation answers `confirm`.
      open: (_component: unknown, config: { data: NodeFormDialogData | ConfirmDialogData }) => {
        const data = config.data;
        opened.push(data);
        const closed =
          'save' in data
            ? from(
                data
                  .save({ ...data.initial, title: data.initial.title || 'New item' })
                  .then((failure) => failure === null),
              )
            : of(confirm);
        return { afterClosed: () => closed };
      },
    };
    TestBed.configureTestingModule({
      providers: [
        ...providePlanTesting(),
        GoalPlanStore,
        PlanEditor,
        { provide: MatDialog, useValue: dialog },
        { provide: AtlasToast, useValue: { show: vi.fn() } },
      ],
    });
    const store = TestBed.inject(GoalPlanStore);
    store.goalId.set(SAMPLE_GOAL_ID);
    await settle(Promise.resolve());
    return { store, editor: TestBed.inject(PlanEditor), toast: TestBed.inject(AtlasToast) };
  }

  async function settle<T>(promise: Promise<T>): Promise<T> {
    TestBed.tick();
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    TestBed.tick();
    return promise;
  }

  it('adds a Step under its Waypoint and confirms with a toast', async () => {
    const { store, editor, toast } = await setup();

    expect(await settle(editor.add(N.submitApplication, 'TASK'))).toBe(true);

    const form = opened[0] as NodeFormDialogData;
    expect(form.mode).toBe('create');
    expect(form.context).toBe('In Submit application');
    expect(store.nodes().some((node) => node.title === 'New item')).toBe(true);
    expect(toast.show).toHaveBeenCalledWith('Step added.');
  });

  it('never offers a node or its descendants as its own prerequisite', async () => {
    const { store, editor, toast } = await setup();
    const waypoint = findNode(store.nodes(), N.submitApplication)!;

    await settle(editor.edit(waypoint));

    const ids = (opened[0] as NodeFormDialogData).prerequisiteOptions.map((option) => option.id);
    expect(ids).not.toContain(N.submitApplication);
    expect(ids).not.toContain(N.draftStatement);
    expect(ids).toContain(N.graduate);
    expect(toast.show).toHaveBeenCalledWith('Waypoint saved.');
  });

  it('warns about the children before a cascading delete', async () => {
    const { store, editor } = await setup();
    const waypoint = findNode(store.nodes(), N.submitApplication)!;

    expect(await settle(editor.remove(waypoint))).toBe(true);

    expect((opened[0] as ConfirmDialogData).message).toMatch(
      /and the 5 Waypoints and Steps inside it/,
    );
    expect(findNode(store.nodes(), N.submitApplication)).toBeUndefined();
    expect(findNode(store.nodes(), N.draftStatement)).toBeUndefined();
  });

  it('keeps the node when the deletion is cancelled', async () => {
    const { store, editor } = await setup();
    confirm = false;

    expect(await settle(editor.remove(findNode(store.nodes(), N.draftStatement)!))).toBe(false);

    expect(findNode(store.nodes(), N.draftStatement)).toBeDefined();
  });

  it('keeps a failed write in the error signal until dismissed', async () => {
    const { editor, toast } = await setup();

    expect(editor.settle('Could not save.', 'Saved.')).toBe(false);
    expect(editor.error()).toBe('Could not save.');
    expect(toast.show).not.toHaveBeenCalled();

    editor.dismiss();
    expect(editor.error()).toBeNull();
  });
});
