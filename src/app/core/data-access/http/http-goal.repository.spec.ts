import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { Goal } from '../../models/goal';
import type { GoalDraft } from '../../models/goal-commands';
import { HttpGoalRepository } from './http-goal.repository';
import { provideAtlasHttp } from './provide-atlas-http';

const draft: GoalDraft = {
  title: 'Destination',
  outcome: null,
  description: null,
  primaryAreaKey: 'CAREER',
  status: 'ACTIVE',
  targetDate: null,
  reward: null,
};

/** Only the fields the adapter reads; the rest of the response is passed through untouched. */
const goal = (patch: Partial<Goal> = {}) =>
  ({ id: 'g-1', version: 2, reward: null, ...patch }) as Goal;

describe('HttpGoalRepository', () => {
  let goals: HttpGoalRepository;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAtlasHttp(), provideHttpClientTesting()] });
    goals = TestBed.inject(HttpGoalRepository);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('lists with filters and the contract sort', () => {
    void firstValueFrom(goals.list({ q: 'study', area: 'CAREER', sort: 'updatedAt' }));
    const request = backend.expectOne((r) => r.url === '/api/v1/goals');
    expect(request.request.params.get('q')).toBe('study');
    expect(request.request.params.get('area')).toBe('CAREER');
    expect(request.request.params.get('sort')).toBe('updatedAt,desc');
    request.flush({ content: [], page: { size: 100, number: 0, totalElements: 0, totalPages: 0 } });
  });

  it('creates without the reward field and with an idempotency key', async () => {
    const created = firstValueFrom(goals.create(draft));
    const request = backend.expectOne('/api/v1/goals');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).not.toHaveProperty('reward');
    expect(request.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
    expect(request.request.headers.has('If-Match')).toBe(false);
    request.flush(goal());
    await expect(created).resolves.toMatchObject({ id: 'g-1' });
  });

  it('sets the reward after a create and answers with the reloaded goal', async () => {
    const created = firstValueFrom(goals.create({ ...draft, reward: '  Trip ' }));
    backend.expectOne('/api/v1/goals').flush(goal({ version: 1 }));
    const reward = backend.expectOne('/api/v1/goals/g-1/reward');
    expect(reward.request.method).toBe('PUT');
    expect(reward.request.body).toEqual({ description: 'Trip' });
    expect(reward.request.headers.get('If-Match')).toBe('"1"');
    reward.flush({ description: 'Trip', status: 'PLANNED' });
    backend
      .expectOne('/api/v1/goals/g-1')
      .flush(goal({ version: 2, reward: { description: 'Trip', status: 'PLANNED' } }));
    await expect(created).resolves.toMatchObject({ version: 2, reward: { description: 'Trip' } });
  });

  it('updates with If-Match and removes a cleared reward', async () => {
    const updated = firstValueFrom(goals.update('g-1', 4, draft));
    const patch = backend.expectOne('/api/v1/goals/g-1');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.headers.get('If-Match')).toBe('"4"');
    patch.flush(goal({ version: 5, reward: { description: 'Trip', status: 'EARNED' } }));
    const remove = backend.expectOne('/api/v1/goals/g-1/reward');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null, { status: 204, statusText: '' });
    backend.expectOne('/api/v1/goals/g-1').flush(goal({ version: 6 }));
    await expect(updated).resolves.toMatchObject({ version: 6, reward: null });
  });

  it('leaves an unchanged reward alone', async () => {
    const reward = { description: 'Trip', status: 'EARNED' } as const;
    const updated = firstValueFrom(goals.update('g-1', 4, { ...draft, reward: 'Trip' }));
    backend.expectOne('/api/v1/goals/g-1').flush(goal({ version: 5, reward }));
    await expect(updated).resolves.toMatchObject({ version: 5, reward });
  });

  it('sends If-Match on actions and cascade on a subtree delete', () => {
    void firstValueFrom(goals.archive('g-1', 2));
    void firstValueFrom(goals.completeNode('g-1', 'n/1', 3));
    void firstValueFrom(goals.reopenNode('g-1', 'n-1', 4));
    void firstValueFrom(goals.removeNode('g-1', 'n-1', 5, true));
    const archive = backend.expectOne('/api/v1/goals/g-1/archive').request;
    expect([archive.method, archive.headers.get('If-Match')]).toEqual(['POST', '"2"']);
    const complete = backend.expectOne('/api/v1/goals/g-1/nodes/n%2F1/complete').request;
    expect(complete.headers.get('If-Match')).toBe('"3"');
    expect(complete.headers.has('Idempotency-Key')).toBe(true);
    expect(
      backend.expectOne('/api/v1/goals/g-1/nodes/n-1/reopen').request.headers.get('If-Match'),
    ).toBe('"4"');
    const remove = backend.expectOne((r) => r.url === '/api/v1/goals/g-1/nodes/n-1');
    expect(remove.request.urlWithParams).toBe('/api/v1/goals/g-1/nodes/n-1?cascade=true');
    expect(remove.request.headers.get('If-Match')).toBe('"5"');
  });

  it('leaves a lifecycle status out of the PATCH body', () => {
    void firstValueFrom(goals.update('g-1', 4, { ...draft, status: null }));
    const patch = backend.expectOne('/api/v1/goals/g-1').request;
    expect(patch.body).not.toHaveProperty('status');
  });

  it('lets the server filter the notes of a node', async () => {
    const notes = firstValueFrom(goals.notes('g-1', 'n-1'));
    const request = backend.expectOne((r) => r.url === '/api/v1/goals/g-1/notes');
    expect(request.request.params.get('nodeId')).toBe('n-1');
    request.flush([{ id: 'b', nodeId: 'n-1' }]);
    await expect(notes).resolves.toEqual([{ id: 'b', nodeId: 'n-1' }]);
  });

  it('sends the note ETag on note edits and deletes', () => {
    void firstValueFrom(goals.updateNote('g-1', 'note-1', 3, 'Edited'));
    void firstValueFrom(goals.removeNote('g-1', 'note-2', 5));
    const patch = backend.expectOne('/api/v1/goals/g-1/notes/note-1').request;
    expect([patch.method, patch.headers.get('If-Match')]).toEqual(['PATCH', '"3"']);
    expect(patch.body).toEqual({ body: 'Edited' });
    const remove = backend.expectOne('/api/v1/goals/g-1/notes/note-2').request;
    expect([remove.method, remove.headers.get('If-Match')]).toEqual(['DELETE', '"5"']);
  });

  it('keeps only the Destination notes when no node is asked', async () => {
    const notes = firstValueFrom(goals.notes('g-1', null));
    const request = backend.expectOne((r) => r.url === '/api/v1/goals/g-1/notes');
    expect(request.request.params.has('nodeId')).toBe(false);
    request.flush([
      { id: 'a', nodeId: null },
      { id: 'b', nodeId: 'n-1' },
    ]);
    await expect(notes).resolves.toEqual([{ id: 'a', nodeId: null }]);
  });

  it('adds a dependency and a note with their request bodies', () => {
    void firstValueFrom(goals.addDependency('g-1', 'a', 'b'));
    void firstValueFrom(goals.addNote('g-1', 'n-1', 'Hello'));
    expect(backend.expectOne('/api/v1/goals/g-1/dependencies').request.body).toEqual({
      prerequisiteNodeId: 'a',
      dependentNodeId: 'b',
    });
    expect(backend.expectOne('/api/v1/goals/g-1/notes').request.body).toEqual({
      nodeId: 'n-1',
      body: 'Hello',
    });
  });
});
