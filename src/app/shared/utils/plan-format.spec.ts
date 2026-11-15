import {
  completedText,
  excludedText,
  goalStatusBadge,
  isBlocked,
  nodeKind,
  nodeStatusKey,
  plannedDateText,
  progressLine,
  rewardText,
} from './plan-format';

describe('plan-format', () => {
  it('labels Destination statuses without inventing new status colours', () => {
    expect(goalStatusBadge('ACTIVE')).toEqual({ status: 'in-progress', label: 'Active' });
    expect(goalStatusBadge('DRAFT')).toEqual({ status: 'not-started', label: 'Draft' });
    expect(goalStatusBadge('PAUSED')).toEqual({ status: 'not-started', label: 'Paused' });
  });

  it('keeps status and availability apart', () => {
    expect(nodeStatusKey({ status: 'IN_PROGRESS' })).toBe('in-progress');
    expect(nodeStatusKey({ status: 'COMPLETED' })).toBe('success');
    expect(isBlocked({ availability: { state: 'LOCKED', reasons: [], override: null } })).toBe(
      true,
    );
    expect(isBlocked({ availability: { state: 'AVAILABLE', reasons: [], override: null } })).toBe(
      false,
    );
  });

  it('names nodes with the UI vocabulary', () => {
    expect(nodeKind({ nodeType: 'TASK' })).toBe('Step');
    expect(nodeKind({ nodeType: 'MILESTONE' })).toBe('Waypoint');
  });

  it('formats planned dates with their precision', () => {
    expect(plannedDateText(null, 'en-US')).toBe('Date not set');
    expect(plannedDateText({ date: '2026-12-01', precision: 'MONTH' }, 'en-US')).toBe(
      'December 2026 · month precision',
    );
  });

  it('formats backend progress without recalculating it', () => {
    const progress = { percent: '40.0', countedWeight: '2', totalWeight: '5' };
    expect(completedText(progress, 'Steps')).toBe('2 of 5 Steps completed');
    expect(completedText({ percent: '40.0' }, 'Steps')).toBeNull();
    expect(completedText(null, 'Steps')).toBeNull();
    expect(progressLine(progress, 'en-US', 'Steps')).toBe('40% · 2 of 5 Steps completed');
    expect(progressLine({ percent: '12.5' }, 'en-US', 'Steps')).toBe('12.5%');
  });

  it('describes a reward without deciding when it is earned', () => {
    expect(rewardText(null)).toBeNull();
    expect(rewardText({ description: 'Graduation celebration', status: 'PLANNED' })).toEqual({
      title: 'Graduation celebration',
      status: 'Planned reward · not earned',
    });
    expect(rewardText({ description: 'Trip', status: 'EARNED' })?.status).toBe('Reward earned');
  });

  it('lists nodes the backend excluded from progress', () => {
    expect(excludedText(null)).toBeNull();
    expect(excludedText({ percent: '20.0', excludedNodes: [] })).toBeNull();
    expect(
      excludedText({
        percent: '20.0',
        excludedNodes: [{ nodeId: 'x', title: 'Optional reading' }],
      }),
    ).toBe('Optional reading is excluded from progress.');
  });
});
