import { inject, Injectable } from '@angular/core';
import { map, type Observable, of, switchMap } from 'rxjs';
import type { Goal, GoalId, GoalSummary, SecondaryArea } from '../../models/goal';
import type {
  GoalDependency,
  GoalDraft,
  GoalQuery,
  GoalSort,
  NodeDraft,
  NodePatch,
} from '../../models/goal-commands';
import type { GoalNode, GoalTree, NodeId } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import { GoalRepository } from '../ports/goal.repository';
import type {
  DependencyRequest,
  GoalAreasRequest,
  GoalWriteRequest,
  NodeCreateRequest,
  NoteRequest,
  RewardRequest,
} from './api-types';
import { AtlasApi } from './atlas-api';

/** `sort` of `GET /goals` per list order (API-CONTRACT §5). */
const SORT: Readonly<Record<GoalSort, string>> = {
  targetDate: 'targetDate,asc',
  title: 'title,asc',
  updatedAt: 'updatedAt,desc',
};

function goalBody(draft: GoalDraft): GoalWriteRequest {
  const { title, outcome, description, primaryAreaKey, status, targetDate } = draft;
  return { title, outcome, description, primaryAreaKey, status, targetDate };
}

const rewardText = (reward: string | null): string | null => reward?.trim() || null;

/**
 * `/api/v1/goals` and its sub-resources (F4-1, API-CONTRACT §9.5–§9.6). Writes of versioned resources send
 * `If-Match`; creates send an `Idempotency-Key`. Notes, dependencies and rewards carry no `version` yet, so their
 * writes go without `If-Match` until FQ-21 is decided.
 */
@Injectable({ providedIn: 'root' })
export class HttpGoalRepository extends GoalRepository {
  private readonly api = inject(AtlasApi);

  list(query: GoalQuery = {}): Observable<readonly GoalSummary[]> {
    const { sort, ...filters } = query;
    return this.api.getAll<GoalSummary>(['goals'], {
      ...filters,
      sort: SORT[sort ?? 'targetDate'],
    });
  }

  get(goalId: GoalId): Observable<Goal> {
    return this.api.get<Goal>(['goals', goalId]);
  }

  tree(goalId: GoalId): Observable<GoalTree> {
    return this.api.get<GoalTree>(['goals', goalId, 'tree']);
  }

  /** `POST /goals`, then `PUT …/reward` when the form names one (the reward is its own resource). */
  create(draft: GoalDraft): Observable<Goal> {
    return this.api
      .post<Goal>(['goals'], goalBody(draft), { idempotencyKey: crypto.randomUUID() })
      .pipe(switchMap((goal) => this.syncReward(goal, draft.reward)));
  }

  /** `PATCH /goals/{goalId}`, then `PUT`/`DELETE …/reward` when the reward text changed. */
  update(goalId: GoalId, version: number, draft: GoalDraft): Observable<Goal> {
    return this.api
      .patch<Goal>(['goals', goalId], goalBody(draft), { version })
      .pipe(switchMap((goal) => this.syncReward(goal, draft.reward)));
  }

  setSecondaryAreas(
    goalId: GoalId,
    version: number,
    areas: readonly SecondaryArea[],
  ): Observable<Goal> {
    const body: GoalAreasRequest = { secondaryAreas: areas };
    return this.api.patch<Goal>(['goals', goalId], body, { version });
  }

  archive(goalId: GoalId, version: number): Observable<Goal> {
    return this.api.post<Goal>(['goals', goalId, 'archive'], null, { version });
  }

  remove(goalId: GoalId, version: number): Observable<void> {
    return this.api.delete(['goals', goalId], { version });
  }

  createNode(goalId: GoalId, draft: NodeDraft): Observable<GoalNode> {
    const { parentId, nodeType, title, outcome, description, dueDate } = draft;
    const body: NodeCreateRequest = { parentId, nodeType, title, outcome, description, dueDate };
    return this.api.post<GoalNode>(['goals', goalId, 'nodes'], body);
  }

  updateNode(
    goalId: GoalId,
    nodeId: NodeId,
    version: number,
    patch: NodePatch,
  ): Observable<GoalNode> {
    return this.api.patch<GoalNode>(['goals', goalId, 'nodes', nodeId], patch, { version });
  }

  removeNode(goalId: GoalId, nodeId: NodeId, version: number, cascade: boolean): Observable<void> {
    return this.api.delete(['goals', goalId, 'nodes', nodeId], {
      version,
      query: cascade ? { cascade: true } : undefined,
    });
  }

  completeNode(goalId: GoalId, nodeId: NodeId, version: number): Observable<GoalNode> {
    return this.api.post<GoalNode>(['goals', goalId, 'nodes', nodeId, 'complete'], null, {
      version,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  reopenNode(goalId: GoalId, nodeId: NodeId, version: number): Observable<GoalNode> {
    return this.api.post<GoalNode>(['goals', goalId, 'nodes', nodeId, 'reopen'], null, {
      version,
    });
  }

  dependencies(goalId: GoalId): Observable<readonly GoalDependency[]> {
    return this.api.getAll<GoalDependency>(['goals', goalId, 'dependencies']);
  }

  addDependency(
    goalId: GoalId,
    prerequisiteNodeId: NodeId,
    dependentNodeId: NodeId,
  ): Observable<GoalDependency> {
    const body: DependencyRequest = { prerequisiteNodeId, dependentNodeId };
    return this.api.post<GoalDependency>(['goals', goalId, 'dependencies'], body);
  }

  removeDependency(goalId: GoalId, dependencyId: string): Observable<void> {
    return this.api.delete(['goals', goalId, 'dependencies', dependencyId]);
  }

  /** `GET …/notes?nodeId=`; the Destination's own notes are those without a node. */
  notes(goalId: GoalId, nodeId: NodeId | null): Observable<readonly GoalNote[]> {
    return this.api
      .getAll<GoalNote>(['goals', goalId, 'notes'], { nodeId })
      .pipe(map((notes) => notes.filter((note) => note.nodeId === nodeId)));
  }

  addNote(goalId: GoalId, nodeId: NodeId | null, body: string): Observable<GoalNote> {
    const request: NoteRequest = { nodeId, body };
    return this.api.post<GoalNote>(['goals', goalId, 'notes'], request);
  }

  updateNote(goalId: GoalId, noteId: string, body: string): Observable<GoalNote> {
    const request: NoteRequest = { body };
    return this.api.patch<GoalNote>(['goals', goalId, 'notes', noteId], request);
  }

  removeNote(goalId: GoalId, noteId: string): Observable<void> {
    return this.api.delete(['goals', goalId, 'notes', noteId]);
  }

  /**
   * Brings the reward in line with the form and answers with the server's goal. The reward write is guarded by the
   * goal's version, which the contract leaves open for sub-resources (FQ-21).
   */
  private syncReward(goal: Goal, reward: string | null): Observable<Goal> {
    const wanted = rewardText(reward);
    if (wanted === (goal.reward?.description ?? null)) {
      return of(goal);
    }
    const path = ['goals', goal.id, 'reward'];
    const write = wanted
      ? this.api.put<unknown>(path, { description: wanted } satisfies RewardRequest, {
          version: goal.version,
        })
      : this.api.delete(path, { version: goal.version });
    return write.pipe(switchMap(() => this.get(goal.id)));
  }
}
