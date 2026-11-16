import type { Progress } from '../../models/progress';

/**
 * Backend-derived values for the sample, transcribed from Figma page 05 (roadmap R-6). They seed the sample; after
 * a write, `mock-recalculation.ts` simulates the backend and reproduces them (its spec checks this). Deleted with the
 * mock (F4-7).
 */
export const SAMPLE_PROGRESS: {
  readonly goal: Progress;
  readonly nodes: Readonly<Record<string, Progress>>;
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
};

/** When the seeded sample Steps were completed; Steps completed in the session get the current time. */
export const SAMPLE_COMPLETION_TIMES: Readonly<Record<string, string>> = {
  'sample-node-confirm-requirements': '2026-11-10T18:00:00Z',
  'sample-node-gather-records': '2026-11-03T17:30:00Z',
};
