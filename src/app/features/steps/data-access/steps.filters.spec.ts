import type { GoalNode } from '../../../core/models/goal-node';
import {
  DEFAULT_STEP_FILTERS,
  matchesStepFilters,
  parseStepFilters,
  stepFilterParams,
} from './steps.filters';

const step = (partial: Partial<GoalNode>): GoalNode =>
  ({
    id: 's',
    status: 'NOT_STARTED',
    dueDate: null,
    availability: { state: 'AVAILABLE', reasons: [], override: null },
    ...partial,
  }) as GoalNode;

describe('steps.filters', () => {
  it('reads known values and falls back to All', () => {
    expect(parseStepFilters({ status: 'COMPLETED', due: 'set' })).toEqual({
      status: 'COMPLETED',
      due: 'set',
    });
    expect(parseStepFilters({ status: 'nope' })).toEqual(DEFAULT_STEP_FILTERS);
  });

  it('drops defaults from the query string', () => {
    expect(stepFilterParams(DEFAULT_STEP_FILTERS)).toEqual({ status: null, due: null });
    expect(stepFilterParams({ status: 'blocked', due: 'not-set' })).toEqual({
      status: 'blocked',
      due: 'not-set',
    });
  });

  it('keeps Blocked availability apart from the work status', () => {
    const locked = step({
      status: 'NOT_STARTED',
      availability: { state: 'LOCKED', reasons: [], override: null },
    });
    expect(matchesStepFilters(locked, { status: 'blocked', due: 'all' })).toBe(true);
    expect(matchesStepFilters(locked, { status: 'NOT_STARTED', due: 'all' })).toBe(true);
    expect(matchesStepFilters(step({}), { status: 'blocked', due: 'all' })).toBe(false);
  });

  it('filters by whether a due date is set', () => {
    const dated = step({ dueDate: { date: '2026-12-01', precision: 'DAY' } });
    expect(matchesStepFilters(dated, { status: 'all', due: 'set' })).toBe(true);
    expect(matchesStepFilters(dated, { status: 'all', due: 'not-set' })).toBe(false);
    expect(matchesStepFilters(step({}), { status: 'all', due: 'not-set' })).toBe(true);
  });
});
