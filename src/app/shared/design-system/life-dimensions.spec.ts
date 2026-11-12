import { LIFE_DIMENSIONS, lifeDimensionByApiKey } from './life-dimensions';

describe('LIFE_DIMENSIONS', () => {
  it('lists the seven dimensions in canonical order with backend enum keys', () => {
    expect(LIFE_DIMENSIONS.map((d) => d.apiKey)).toEqual([
      'CAREER',
      'FINANCE',
      'HEALTH',
      'LOVE',
      'PASSION',
      'FRIENDSHIP',
      'FAMILY',
    ]);
  });

  it('resolves backend enum values and rejects unknown ones', () => {
    expect(lifeDimensionByApiKey('HEALTH')?.color.strong).toBe(
      'var(--color-dimension-health-strong)',
    );
    expect(lifeDimensionByApiKey('health')).toBeUndefined();
  });
});
