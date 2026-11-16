import type { GoalConnection } from '../../../core/models/connection';
import type { GoalSummary } from '../../../core/models/goal';
import {
  countPhrase,
  selectedLabel,
  selectedRelationships,
  toConnectionsVm,
  type ConnectionsFilters,
} from './connections.view-model';

const ALL: ConnectionsFilters = { relationship: 'all', dimension: null };

const goal = {
  id: 'g1',
  title: 'Master’s degree',
  primaryAreaKey: 'CAREER',
  status: 'ACTIVE',
  targetDate: null,
  progress: { percent: '20.0', countedWeight: '2', totalWeight: '10' },
  nextAvailableNode: null,
  reward: null,
} as unknown as GoalSummary;

const association: GoalConnection = {
  id: 'g1:CAREER',
  goalId: 'g1',
  goalTitle: 'Master’s degree',
  areaKey: 'CAREER',
  kind: 'ASSOCIATION',
  primary: true,
  verified: true,
  impact: null,
};

const impact: GoalConnection = {
  id: 'g1:FINANCE:impact',
  goalId: 'g1',
  goalTitle: 'Master’s degree',
  areaKey: 'FINANCE',
  kind: 'POSSIBLE_IMPACT',
  primary: false,
  verified: false,
  impact: {
    title: 'Potential financial effect',
    description: 'Fees could affect Finance.',
    subject: 'Programme / fees',
    subjectConfirmed: false,
    money: null,
    effectiveFrom: null,
    assumptions: 'Fees are unknown.',
  },
};

describe('connections view model', () => {
  it('counts in words', () => {
    expect(countPhrase(1, 'destination')).toBe('One destination');
    expect(countPhrase(2, 'relationship')).toBe('Two relationships');
    expect(countPhrase(14, 'relationship')).toBe('14 relationships');
  });

  it('builds the graph with the backend progress and solid or dashed lines', () => {
    const vm = toConnectionsVm([association, impact], [goal], ALL, 'en-US');

    expect(vm.heading).toBe('One destination. Two relationships.');
    expect(vm.nodes.map((node) => node.label)).toEqual([
      'Master’s degree · 20%',
      'Career',
      'Finance',
    ]);
    expect(vm.edges.map((edge) => edge.line)).toEqual(['solid', 'dashed']);
    expect(vm.noSelection).toBe(
      'No relationship selected. Career is the primary assignment; Finance is an unverified possible impact.',
    );
    expect(vm.contexts[0].line).toBe('Active · Career · 20% · 2 of 10 steps complete');
  });

  it('never invents an amount or a period', () => {
    const vm = toConnectionsVm([impact], [goal], ALL, 'en-US');

    expect(vm.relationships[0].kindLabel).toBe('Possible impact · illustrative / unverified');
    expect(vm.relationships[0].facts).toEqual([
      { label: 'Programme / fees', value: 'Not confirmed' },
      { label: 'Amount', value: 'No amount provided' },
      { label: 'Period', value: 'Not set' },
    ]);
  });

  it('filters by relationship and dimension', () => {
    const associations = toConnectionsVm(
      [association, impact],
      [goal],
      {
        relationship: 'association',
        dimension: null,
      },
      'en-US',
    );
    expect(associations.relationships.map((item) => item.id)).toEqual(['g1:CAREER']);

    const none = toConnectionsVm(
      [association, impact],
      [goal],
      {
        relationship: 'association',
        dimension: 'FINANCE',
      },
      'en-US',
    );
    expect(none.filteredOut).toBe(true);
    expect(none.dimensionOptions.map((option) => option.value)).toEqual(['CAREER', 'FINANCE']);
  });

  it('selects the relationships of a node', () => {
    const vm = toConnectionsVm([association, impact], [goal], ALL, 'en-US');

    expect(selectedRelationships(vm, 'area:FINANCE').map((item) => item.id)).toEqual([
      'g1:FINANCE:impact',
    ]);
    expect(selectedRelationships(vm, 'goal:g1')).toHaveLength(2);
    expect(selectedLabel(vm, 'area:FINANCE')).toBe('Finance');
    expect(selectedRelationships(vm, null)).toEqual([]);
  });
});
