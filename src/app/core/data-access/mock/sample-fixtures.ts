import type { NodeStatus } from '../../models/goal-node';
import type { Progress } from '../../models/progress';

/**
 * Backend-derived values for the sample, transcribed from Figma page 05 (roadmap R-6). The mock contains no
 * progress rule; it returns these values as the backend would (frontend.md §6.3). Deleted with the mock (F4-7).
 */
export const SAMPLE_PROGRESS: {
  readonly goal: Progress;
  readonly nodes: Readonly<Record<string, Progress>>;
  readonly career: Progress;
} = {
  // 20 % · 2 of 10 equally weighted leaves; the optional thesis is excluded.
  goal: {
    percent: '20.0',
    policy: 'DERIVED',
    countedWeight: '2',
    totalWeight: '10',
    excludedNodes: [{ nodeId: 'sample-node-thesis', title: 'Complete thesis/capstone' }],
  },
  nodes: {
    // 40 % · 2 of 5 Steps.
    'sample-node-submit-application': {
      percent: '40.0',
      policy: 'DERIVED',
      countedWeight: '2',
      totalWeight: '5',
    },
  },
  career: { percent: '20.0' },
};

/** Backend-reported values of the sample for one number of completed application Steps. */
export interface SampleStage {
  readonly application: Progress;
  readonly goal: Progress;
  readonly career: Progress;
  /** Work status the backend reports for "Submit application" (whether it follows its Steps is FQ-18). */
  readonly applicationStatus: NodeStatus;
  readonly achievedWaypoints: number;
}

const stage = (done: number, percent: string, goalPercent: string): SampleStage => ({
  application: {
    percent,
    policy: 'DERIVED',
    countedWeight: String(done),
    totalWeight: '5',
  },
  goal: { ...SAMPLE_PROGRESS.goal, percent: goalPercent, countedWeight: String(done) },
  career: { percent: goalPercent },
  applicationStatus: done === 5 ? 'COMPLETED' : 'IN_PROGRESS',
  achievedWaypoints: done === 5 ? 1 : 0,
});

/**
 * Backend values keyed by the number of completed Steps of "Submit application" (roadmap R-6). The mock looks them
 * up; it never computes them.
 * - 2: the untouched sample (Figma page 05).
 * - 3: Flow D, "Draft personal statement" completed (page 08 Updated scenario): 60 % · 3 of 5 and 30 % · 3 of 10.
 * - 4: intermediate state between the two Figma flows (not drawn in Figma): 80 % · 4 of 5 and 40 % · 4 of 10.
 * - 5: Flow G (page 14 Milestone example): 100 % · 5 of 5, the Waypoint achieved, 50 % · 5 of 10.
 */
export const SAMPLE_STAGES: Readonly<Record<number, SampleStage>> = {
  2: stage(2, '40.0', '20.0'),
  3: stage(3, '60.0', '30.0'),
  4: stage(4, '80.0', '40.0'),
  5: stage(5, '100.0', '50.0'),
};

/**
 * Placeholder the mock returns for a Destination created in the session: the mock has no progress rule, so it
 * reports no counted work. Not a backend value (production-readiness §2.1).
 */
export const MOCK_NEW_GOAL_PROGRESS: Progress = {
  percent: '0.0',
  policy: 'DERIVED',
  countedWeight: '0',
  totalWeight: '0',
};

/** When the sample Steps were completed, newest first; the others apply after Flow D and Flow G. */
export const SAMPLE_COMPLETED_AT = {
  submitTheApplication: '2026-11-12T11:00:00Z',
  reviewChecklist: '2026-11-12T10:00:00Z',
  draftStatement: '2026-11-12T09:00:00Z',
  confirmRequirements: '2026-11-10T18:00:00Z',
  gatherRecords: '2026-11-03T17:30:00Z',
} as const;
