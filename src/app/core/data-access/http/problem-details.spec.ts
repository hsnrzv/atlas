import { HttpErrorResponse } from '@angular/common/http';
import { reasonForStatus, toAtlasDataError } from './problem-details';

const failure = (status: number, error: unknown = null) =>
  new HttpErrorResponse({ status, error, url: '/api/v1/goals' });

describe('Problem Details mapping', () => {
  it.each([
    [0, 'network'],
    [400, 'validation'],
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [409, 'conflict'],
    [412, 'conflict'],
    [422, 'validation'],
    [428, 'conflict'],
    [500, 'unavailable'],
    [503, 'unavailable'],
  ] as const)('maps status %i to %s', (status, reason) => {
    expect(reasonForStatus(status)).toBe(reason);
  });

  it('localises from the code and never shows the server detail', () => {
    const error = toAtlasDataError(
      failure(409, { code: 'NODE_LOCKED', detail: 'Internal: node 42 locked by dep 7' }),
    );
    expect(error).toMatchObject({ reason: 'conflict', code: 'NODE_LOCKED' });
    expect(error.message).toBe('This Step is blocked by an open prerequisite.');
    expect(error.message).not.toContain('Internal');
  });

  it('names a stale version even without a body', () => {
    expect(toAtlasDataError(failure(412))).toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(toAtlasDataError(failure(428))).toMatchObject({ code: 'PRECONDITION_REQUIRED' });
  });

  it('keeps field errors by field path with local copy', () => {
    const error = toAtlasDataError(
      failure(400, {
        code: 'VALIDATION_FAILED',
        errors: [
          { field: 'title', code: 'NotBlank', message: 'must not be blank' },
          { field: 'targetDate.precision', code: 'InvalidEnum', message: 'raw' },
          { field: 'title', code: 'Size', message: 'second error on the same field' },
          { field: 'outcome', code: 'Something', message: 'raw' },
        ],
      }),
    );
    expect(error.reason).toBe('validation');
    expect(error.fieldErrors).toEqual({
      title: 'Enter a value.',
      'targetDate.precision': 'Choose one of the options.',
      outcome: 'Check this value.',
    });
  });

  it('falls back to the reason copy for unknown codes and non-JSON bodies', () => {
    expect(toAtlasDataError(failure(503, '<html>Bad gateway</html>')).message).toBe(
      'The Atlas service is not available right now.',
    );
    expect(toAtlasDataError(failure(409, { code: 'SOMETHING_NEW' })).message).toContain(
      'conflicts with the current plan',
    );
  });
});
