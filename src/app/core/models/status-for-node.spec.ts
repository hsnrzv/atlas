import { statusForNode } from './status-for-node';

describe('statusForNode (D14)', () => {
  it('maps the stored work status', () => {
    expect(statusForNode({ status: 'COMPLETED' })).toBe('success');
    expect(statusForNode({ status: 'IN_PROGRESS' })).toBe('in-progress');
    expect(statusForNode({ status: 'NOT_STARTED' })).toBe('not-started');
    expect(statusForNode({ status: 'SKIPPED' })).toBe('skipped');
    expect(statusForNode({ status: 'CANCELLED' })).toBe('cancelled');
  });

  it('shows a lock as blocked unless the node is already finished', () => {
    const locked = { state: 'LOCKED' } as const;
    expect(statusForNode({ status: 'NOT_STARTED', availability: locked })).toBe('blocked');
    expect(statusForNode({ status: 'IN_PROGRESS', availability: locked })).toBe('blocked');
    expect(statusForNode({ status: 'COMPLETED', availability: locked })).toBe('success');
    expect(statusForNode({ status: 'NOT_STARTED', availability: { state: 'OVERRIDDEN' } })).toBe(
      'not-started',
    );
  });

  it('uses only backend flags for at-risk and upcoming', () => {
    expect(statusForNode({ status: 'IN_PROGRESS', atRisk: true })).toBe('at-risk');
    expect(statusForNode({ status: 'NOT_STARTED', dueSoon: true })).toBe('upcoming');
    expect(statusForNode({ status: 'IN_PROGRESS', dueSoon: true })).toBe('in-progress');
  });
});
