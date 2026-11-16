import type { Goal } from '../../models/goal';
import type { GoalDraft } from '../../models/goal-commands';
import type { GoalNode, NodeAvailability } from '../../models/goal-node';
import { SAMPLE_PROGRESS } from './sample-fixtures';

/**
 * The single development sample (project-instruction §10.5, figma-handoff §6). Structure, statuses and planned dates
 * only; every derived value comes from `sample-fixtures.ts`. No other Destinations, curricula or dates may be
 * added (frontend.md §6.4). This is an illustration, not real programme or admission information.
 */
export const SAMPLE_GOAL_ID = 'sample-goal-masters';

/** Typographic apostrophe, as in Figma and §10.5. */
export const SAMPLE_GOAL_TITLE = 'Complete an online Master’s degree in Computer Science / AI';

export const SAMPLE_NODE_IDS = {
  submitApplication: 'sample-node-submit-application',
  confirmRequirements: 'sample-node-confirm-requirements',
  gatherRecords: 'sample-node-gather-records',
  draftStatement: 'sample-node-draft-statement',
  reviewChecklist: 'sample-node-review-checklist',
  submitTheApplication: 'sample-node-submit-the-application',
  admissionDecision: 'sample-node-admission-decision',
  startStudying: 'sample-node-start-studying',
  foundationalCoursework: 'sample-node-foundational-coursework',
  electiveCoursework: 'sample-node-elective-coursework',
  thesis: 'sample-node-thesis',
  graduate: 'sample-node-graduate',
} as const;

const N = SAMPLE_NODE_IDS;
const AVAILABLE: NodeAvailability = { state: 'AVAILABLE', reasons: [], override: null };

type NodeSeed = Pick<GoalNode, 'id' | 'nodeType' | 'title' | 'status'> &
  Partial<
    Pick<
      GoalNode,
      | 'parentId'
      | 'dueDate'
      | 'availability'
      | 'childCount'
      | 'progressWeight'
      | 'outcome'
      | 'description'
    >
  >;

function node(seed: NodeSeed, sortOrder: number): GoalNode {
  return {
    goalId: SAMPLE_GOAL_ID,
    parentId: null,
    outcome: null,
    description: null,
    startDate: null,
    dueDate: null,
    progressWeight: '1',
    availability: AVAILABLE,
    progress: SAMPLE_PROGRESS.nodes[seed.id] ?? null,
    reward: null,
    childCount: 0,
    version: 1,
    sortOrder,
    ...seed,
  };
}

const step = (
  id: string,
  title: string,
  status: GoalNode['status'],
  sortOrder: number,
  extra: Partial<NodeSeed> = {},
) =>
  node({ id, nodeType: 'TASK', title, status, parentId: N.submitApplication, ...extra }, sortOrder);

export const SAMPLE_NODES: readonly GoalNode[] = [
  node(
    {
      id: N.submitApplication,
      nodeType: 'MILESTONE',
      title: 'Submit application',
      status: 'IN_PROGRESS',
      dueDate: { date: '2026-12-01', precision: 'MONTH' },
      childCount: 5,
      // Figma page 07 Waypoint detail (230:19060).
      outcome:
        'Application submitted and confirmation saved. Refine this outcome for your own programme and application.',
    },
    1,
  ),
  step(N.confirmRequirements, 'Confirm programme requirements', 'COMPLETED', 1),
  step(N.gatherRecords, 'Gather academic records', 'COMPLETED', 2),
  // Copy from Figma page 08 Step detail (230:15878): the user's own acceptance criteria, not university rules.
  step(N.draftStatement, 'Draft personal statement', 'IN_PROGRESS', 3, {
    description:
      'Prepare a first draft that explains your interests in Computer Science / AI and why this destination matters to you.',
    outcome: [
      '1. I have explained my motivation for studying Computer Science / AI.',
      '2. I have connected relevant experience to my learning goals.',
      '3. I have reviewed the draft for clarity and saved a version to revisit.',
    ].join('\n'),
  }),
  step(N.reviewChecklist, 'Review application checklist', 'NOT_STARTED', 4),
  step(N.submitTheApplication, 'Submit the application', 'NOT_STARTED', 5, {
    availability: {
      state: 'LOCKED',
      reasons: [
        {
          prerequisiteNodeId: N.reviewChecklist,
          title: 'Review application checklist',
          status: 'NOT_STARTED',
        },
      ],
      override: null,
    },
  }),
  node(
    {
      id: N.admissionDecision,
      nodeType: 'MILESTONE',
      title: 'Receive admission decision',
      status: 'NOT_STARTED',
    },
    2,
  ),
  // "Fall 2027" has no contract precision in the MVP (no seasons), so the sample keeps year precision.
  node(
    {
      id: N.startStudying,
      nodeType: 'MILESTONE',
      title: 'Start studying',
      status: 'NOT_STARTED',
      dueDate: { date: '2027-01-01', precision: 'YEAR' },
    },
    3,
  ),
  node(
    {
      id: N.foundationalCoursework,
      nodeType: 'MILESTONE',
      title: 'Complete foundational coursework',
      status: 'NOT_STARTED',
    },
    4,
  ),
  node(
    {
      id: N.electiveCoursework,
      nodeType: 'MILESTONE',
      title: 'Complete elective coursework',
      status: 'NOT_STARTED',
    },
    5,
  ),
  // Optional, and depends on the actual programme requirements: excluded from progress (see the fixtures).
  node(
    {
      id: N.thesis,
      nodeType: 'MILESTONE',
      title: 'Complete thesis/capstone',
      status: 'NOT_STARTED',
      progressWeight: '0',
    },
    6,
  ),
  node(
    {
      id: N.graduate,
      nodeType: 'MILESTONE',
      title: 'Graduate',
      status: 'NOT_STARTED',
      dueDate: { date: '2030-01-01', precision: 'YEAR' },
    },
    7,
  ),
];

export const SAMPLE_GOAL: Goal = {
  id: SAMPLE_GOAL_ID,
  title: SAMPLE_GOAL_TITLE,
  outcome: null,
  description: null,
  primaryAreaKey: 'CAREER',
  secondaryAreas: [],
  priority: null,
  status: 'ACTIVE',
  startDate: null,
  targetDate: { date: '2030-01-01', precision: 'YEAR' },
  progress: SAMPLE_PROGRESS.goal,
  nextAvailableNode: { id: N.submitApplication, title: 'Submit application' },
  reward: { description: 'Graduation celebration', status: 'PLANNED' },
  expectedWeeklyEffortMinutes: null,
  createdAt: '2026-11-01T09:00:00Z',
  updatedAt: '2026-11-10T18:00:00Z',
  version: 1,
};

/** Values for the dev-only "Use sample details" button of the Destination form (Figma page 06, filled form). */
export const SAMPLE_GOAL_DRAFT: GoalDraft = {
  title: SAMPLE_GOAL.title,
  outcome: SAMPLE_GOAL.outcome,
  description: SAMPLE_GOAL.description,
  primaryAreaKey: SAMPLE_GOAL.primaryAreaKey,
  status: SAMPLE_GOAL.status,
  targetDate: SAMPLE_GOAL.targetDate,
  reward: SAMPLE_GOAL.reward?.description ?? null,
};
