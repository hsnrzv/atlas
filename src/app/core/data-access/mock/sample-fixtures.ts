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

/** Counts shown in "At a glance" and the hero (page 05). */
export const SAMPLE_SUMMARY = { activeGoals: 1, achievedWaypoints: 0 } as const;

/** When the sample Steps were completed, newest first. */
export const SAMPLE_COMPLETED_AT = {
  confirmRequirements: '2026-11-10T18:00:00Z',
  gatherRecords: '2026-11-03T17:30:00Z',
} as const;
