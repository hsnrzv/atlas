import type { GoalNode, NodeStatus } from '../../../core/models/goal-node';
import { NODE_STATUS_OPTIONS } from '../../../shared/utils/plan-format';

export type StepStatusFilter = 'all' | NodeStatus | 'blocked';
export type StepDueFilter = 'all' | 'set' | 'not-set';

export interface StepFilters {
  readonly status: StepStatusFilter;
  readonly due: StepDueFilter;
}

export const DEFAULT_STEP_FILTERS: StepFilters = { status: 'all', due: 'all' };

export const STEP_STATUS_OPTIONS: readonly { value: StepStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...NODE_STATUS_OPTIONS,
  { value: 'blocked', label: 'Blocked' },
];

export const STEP_DUE_OPTIONS: readonly { value: StepDueFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'set', label: 'Due date set' },
  { value: 'not-set', label: 'No due date' },
];

const pick = <T extends string>(options: readonly { value: T }[], raw: string | undefined): T =>
  options.find((option) => option.value === raw)?.value ?? options[0].value;

/** Reads the filters from the query string; unknown values fall back to "All". */
export function parseStepFilters(raw: { status?: string; due?: string }): StepFilters {
  return { status: pick(STEP_STATUS_OPTIONS, raw.status), due: pick(STEP_DUE_OPTIONS, raw.due) };
}

/** Query parameters for the filters; defaults are dropped so the URL stays short. */
export function stepFilterParams(filters: StepFilters): Record<string, string | null> {
  return {
    status: filters.status === 'all' ? null : filters.status,
    due: filters.due === 'all' ? null : filters.due,
  };
}

/**
 * Filters Steps by their stored work status or Blocked availability (kept apart, Figma page 08) and by whether a
 * due date is set. Display filtering only; nothing is derived.
 */
export function matchesStepFilters(step: GoalNode, filters: StepFilters): boolean {
  const status =
    filters.status === 'all' ||
    (filters.status === 'blocked'
      ? step.availability.state === 'LOCKED'
      : step.status === filters.status);
  const due = filters.due === 'all' || (filters.due === 'set' ? !!step.dueDate : !step.dueDate);
  return status && due;
}
