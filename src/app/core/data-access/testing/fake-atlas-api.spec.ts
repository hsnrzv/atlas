import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AtlasDataError } from '../data-error';
import { AtlasApi } from '../http/atlas-api';
import { MOCK_LATENCY_MS } from '../mock/mock-responder';
import { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N } from '../mock/sample-plan';
import { FakeAtlasApi, providePlanTesting } from './plan-testing';

describe('FakeAtlasApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [providePlanTesting('sample', 'http')] });
  });
  afterEach(() => vi.useRealTimers());

  async function settle<T>(promise: Promise<T>): Promise<T> {
    const settled = promise.then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    const result = await settled;
    if ('error' in result) {
      throw result.error;
    }
    return result.value;
  }

  async function failure(promise: Promise<unknown>): Promise<AtlasDataError> {
    try {
      await settle(promise);
    } catch (error) {
      expect(error).toBeInstanceOf(AtlasDataError);
      return error as AtlasDataError;
    }
    throw new Error('Expected the request to fail.');
  }

  const api = () => TestBed.inject(AtlasApi);
  const nodePath = (nodeId: string) => ['goals', SAMPLE_GOAL_ID, 'nodes', nodeId];

  it('serves the sample under /api/v1 through the real interceptor', async () => {
    const goal = await settle(firstValueFrom(api().get<{ id: string }>(['goals', SAMPLE_GOAL_ID])));
    expect(goal.id).toBe(SAMPLE_GOAL_ID);
    const request = TestBed.inject(FakeAtlasApi).requests[0];
    expect(request.url).toBe(`/api/v1/goals/${SAMPLE_GOAL_ID}`);
    expect(request.headers.get('Accept')).toContain('application/problem+json');
  });

  it('answers 428 when a versioned write has no If-Match', async () => {
    const error = await failure(
      firstValueFrom(api().patch(nodePath(N.draftStatement), { title: 'Draft it' })),
    );
    expect(error.reason).toBe('conflict');
    expect(error.code).toBe('PRECONDITION_REQUIRED');
  });

  it('answers 412 for a stale If-Match version', async () => {
    const error = await failure(
      firstValueFrom(
        api().patch(nodePath(N.draftStatement), { title: 'Draft it' }, { version: 99 }),
      ),
    );
    expect(error.code).toBe('VERSION_CONFLICT');
  });

  it('rejects unknown request properties with 400', async () => {
    const error = await failure(
      firstValueFrom(
        api().patch(nodePath(N.draftStatement), { title: 'Draft it', progress: 1 }, { version: 1 }),
      ),
    );
    expect(error.reason).toBe('validation');
  });

  it('answers 404 as not-found', async () => {
    const error = await failure(firstValueFrom(api().get(['goals', 'missing'])));
    expect(error.reason).toBe('not-found');
  });
});
