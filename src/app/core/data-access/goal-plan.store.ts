import { computed, effect, inject, Injectable, signal, type Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, type Observable } from 'rxjs';
import type { Goal, GoalId, GoalSummary } from '../models/goal';
import type { GoalDraft, NodeDraft, NodePatch, SettableNodeStatus } from '../models/goal-commands';
import type { GoalNode, NodeId } from '../models/goal-node';
import type { GoalNote } from '../models/goal-note';
import {
  AtlasDataError,
  isVersionConflict,
  writeErrorMessage,
  writeFailure,
  type WriteFailure,
} from './data-error';
import { GoalRepository } from './ports/goal.repository';

export type GoalPlanState = 'idle' | 'loading' | 'ready' | 'not-found' | 'error';

/** State of an overview page that picks a Destination; `empty` when the user has none yet. */
export type GoalScopeState = Exclude<GoalPlanState, 'idle'> | 'empty';

/** Outcome of a write: the saved value, or the error to show next to the form or action. */
export type WriteResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: AtlasDataError };

/** `null` when the write succeeded, else the message to show. */
export const messageOf = (result: WriteResult<unknown>): string | null =>
  result.ok ? null : writeErrorMessage(result.error);

/** `null` when the write succeeded, else the form-level and field-level messages. */
export const failureOf = (result: WriteResult<unknown>): WriteFailure | null =>
  result.ok ? null : writeFailure(result.error);

const asDataError = (error: unknown): AtlasDataError =>
  error instanceof AtlasDataError
    ? error
    : new AtlasDataError('Could not save. Check your connection and try again.', 'network');

/**
 * One Destination's plan (goal, tree, prerequisites, notes) and its writes, shared by the Destinations, Waypoints
 * and Steps features (F2-5…F3-3). Features never import each other, so the store lives here; each route provides
 * its own instance. After a write it reloads the goal, tree and prerequisites from the backend, which owns progress
 * and availability (frontend.md §6.3), so there are no optimistic updates.
 *
 * Versioned writes send the `version` the user saw (`If-Match`). On `412 VERSION_CONFLICT` the store reloads the plan
 * and reports the conflict; the next write of the same resource then uses the reloaded version, because the user has
 * been told and chose to save again (F4-3, API-CONTRACT §7). There are no silent lost updates.
 */
@Injectable()
export class GoalPlanStore {
  private readonly repository = inject(GoalRepository);

  /** The Destination being shown; `null` until the page knows it. */
  readonly goalId = signal<GoalId | null>(null);
  /** Whose notes to load: the goal (`null`) or one node. */
  readonly notesNodeId = signal<NodeId | null>(null);
  private readonly listEnabled = signal(false);
  private readonly writing = signal(false);
  private visited = false;
  /** Resources whose last write hit a version conflict that the user has been shown (`goal:…`, `node:…`). */
  private readonly conflicted = new Set<string>();

  private readonly goalResource = rxResource({
    params: () => this.goalId() ?? undefined,
    stream: ({ params }) => this.repository.get(params),
  });
  private readonly treeResource = rxResource({
    params: () => this.goalId() ?? undefined,
    stream: ({ params }) => this.repository.tree(params),
  });
  private readonly dependencyResource = rxResource({
    params: () => this.goalId() ?? undefined,
    stream: ({ params }) => this.repository.dependencies(params),
  });
  private readonly notesResource = rxResource({
    params: () => {
      const goalId = this.goalId();
      return goalId ? { goalId, nodeId: this.notesNodeId() } : undefined;
    },
    stream: ({ params }) => this.repository.notes(params.goalId, params.nodeId),
  });
  private readonly listResource = rxResource({
    params: () => (this.listEnabled() ? true : undefined),
    stream: () => this.repository.list({ sort: 'targetDate' }),
  });

  readonly goal = computed<Goal | null>(() =>
    this.goalResource.hasValue() ? this.goalResource.value() : null,
  );
  readonly nodes = computed<readonly GoalNode[]>(() =>
    this.treeResource.hasValue() ? this.treeResource.value().nodes : [],
  );
  readonly dependencies = computed(() =>
    this.dependencyResource.hasValue() ? this.dependencyResource.value() : [],
  );
  readonly notes = computed<readonly GoalNote[]>(() =>
    this.notesResource.hasValue() ? this.notesResource.value() : [],
  );
  readonly notesLoading = computed(() => this.notesResource.isLoading());
  readonly saving = this.writing.asReadonly();

  /** Destinations for a selector, after `loadGoalList()`. `undefined` while loading. */
  readonly goals = computed<readonly GoalSummary[] | undefined>(() =>
    this.listResource.hasValue() ? this.listResource.value() : undefined,
  );
  readonly goalsFailed = computed(() => this.listResource.status() === 'error');

  readonly state = computed<GoalPlanState>(() => {
    if (!this.goalId()) {
      return 'idle';
    }
    const error = this.goalResource.error() ?? this.treeResource.error();
    if (error) {
      return error instanceof AtlasDataError && error.reason === 'not-found'
        ? 'not-found'
        : 'error';
    }
    return this.goal() && this.treeResource.hasValue() ? 'ready' : 'loading';
  });

  /** Callbacks for `atlas-notes-panel`, scoped to `notesNodeId`. */
  readonly notesHandler = {
    add: (body: string) => this.addNote(body).then(messageOf),
    update: (noteId: string, body: string) => this.updateNote(noteId, body).then(messageOf),
    remove: (noteId: string) => this.removeNote(noteId).then(messageOf),
  };

  loadGoalList(): void {
    this.listEnabled.set(true);
  }

  /**
   * Overview pages (Waypoints, Steps): show `chosen`, else the first Destination by target date. Call in an
   * injection context; returns the page state.
   */
  scopeTo(chosen: () => GoalId | undefined): Signal<GoalScopeState> {
    this.loadGoalList();
    effect(() => this.goalId.set(chosen() ?? this.goals()?.[0]?.id ?? null));
    return computed<GoalScopeState>(() => {
      if (!chosen()) {
        if (this.goalsFailed()) {
          return 'error';
        }
        const goals = this.goals();
        if (!goals) {
          return 'loading';
        }
        if (!goals.length) {
          return 'empty';
        }
      }
      const state = this.state();
      return state === 'idle' ? 'loading' : state;
    });
  }

  /**
   * Called when a page opens. The route keeps this store between visits, so a later visit refreshes the plan in the
   * background (for example after a Step was completed on another page) and keeps the shown values meanwhile.
   */
  enter(): void {
    if (this.visited) {
      this.retry();
    }
    this.visited = true;
  }

  retry(): void {
    this.goalResource.reload();
    this.treeResource.reload();
    this.dependencyResource.reload();
    this.notesResource.reload();
    if (this.listEnabled()) {
      this.listResource.reload();
    }
  }

  // Destination writes (F2-6, F2-7).

  /** `version` is the one the form was opened with; it defaults to the shown goal's. */
  updateGoal(draft: GoalDraft, version?: number): Promise<WriteResult<Goal>> {
    const goal = this.goal();
    return goal
      ? this.versioned(`goal:${goal.id}`, version ?? goal.version, goal.version, (current) =>
          this.repository.update(goal.id, current, draft),
        )
      : this.missing();
  }

  archiveGoal(): Promise<WriteResult<Goal>> {
    const goal = this.goal();
    return goal
      ? this.versioned(
          `goal:${goal.id}`,
          goal.version,
          goal.version,
          (version) => this.repository.archive(goal.id, version),
          false,
        )
      : this.missing();
  }

  removeGoal(): Promise<WriteResult<void>> {
    const goal = this.goal();
    return goal
      ? this.versioned(
          `goal:${goal.id}`,
          goal.version,
          goal.version,
          (version) => this.repository.remove(goal.id, version),
          false,
        )
      : this.missing();
  }

  // Waypoint and Step writes (F3-1, F3-2).

  async createNode(
    draft: NodeDraft,
    prerequisites: readonly NodeId[] = [],
  ): Promise<WriteResult<GoalNode>> {
    const goalId = this.goalId();
    if (!goalId) {
      return this.missing();
    }
    return this.write(this.repository.createNode(goalId, draft), true, async (node) => {
      for (const prerequisite of prerequisites) {
        await firstValueFrom(this.repository.addDependency(goalId, prerequisite, node.id));
      }
    });
  }

  async updateNode(
    node: GoalNode,
    patch: NodePatch,
    prerequisites?: readonly NodeId[],
  ): Promise<WriteResult<GoalNode>> {
    return this.versionedNode(
      node,
      (version) => this.repository.updateNode(node.goalId, node.id, version, patch),
      prerequisites ? () => this.syncPrerequisites(node, prerequisites) : undefined,
    );
  }

  removeNode(node: GoalNode, cascade: boolean): Promise<WriteResult<void>> {
    return this.versionedNode(node, (version) =>
      this.repository.removeNode(node.goalId, node.id, version, cascade),
    );
  }

  completeNode(node: GoalNode): Promise<WriteResult<GoalNode>> {
    return this.versionedNode(node, (version) =>
      this.repository.completeNode(node.goalId, node.id, version),
    );
  }

  reopenNode(node: GoalNode): Promise<WriteResult<GoalNode>> {
    return this.versionedNode(node, (version) =>
      this.repository.reopenNode(node.goalId, node.id, version),
    );
  }

  setNodeStatus(node: GoalNode, status: SettableNodeStatus): Promise<WriteResult<GoalNode>> {
    return this.updateNode(node, { status });
  }

  /** Prerequisites of `nodeId` (ids of the nodes it waits for). */
  prerequisitesOf(nodeId: NodeId): NodeId[] {
    return this.dependencies()
      .filter((dependency) => dependency.dependentNodeId === nodeId)
      .map((dependency) => dependency.prerequisiteNodeId);
  }

  // Notes (F3-3).

  addNote(body: string): Promise<WriteResult<GoalNote>> {
    const goalId = this.goalId();
    return goalId
      ? this.writeNote(this.repository.addNote(goalId, this.notesNodeId(), body))
      : this.missing();
  }

  updateNote(noteId: string, body: string): Promise<WriteResult<GoalNote>> {
    const goalId = this.goalId();
    return goalId
      ? this.writeNote(this.repository.updateNote(goalId, noteId, body))
      : this.missing();
  }

  removeNote(noteId: string): Promise<WriteResult<void>> {
    const goalId = this.goalId();
    return goalId ? this.writeNote(this.repository.removeNote(goalId, noteId)) : this.missing();
  }

  private async syncPrerequisites(node: GoalNode, wanted: readonly NodeId[]): Promise<void> {
    const current = this.dependencies().filter((dep) => dep.dependentNodeId === node.id);
    for (const dependency of current) {
      if (!wanted.includes(dependency.prerequisiteNodeId)) {
        await firstValueFrom(this.repository.removeDependency(node.goalId, dependency.id));
      }
    }
    for (const prerequisite of wanted) {
      if (!current.some((dep) => dep.prerequisiteNodeId === prerequisite)) {
        await firstValueFrom(this.repository.addDependency(node.goalId, prerequisite, node.id));
      }
    }
  }

  /**
   * A write guarded by `If-Match`. `seen` is the version the user acted on; after a conflict the user has been shown,
   * the next write uses `latest` instead. A new conflict reloads the plan so the page shows the current values.
   */
  private async versioned<T>(
    key: string,
    seen: number,
    latest: number,
    request: (version: number) => Observable<T>,
    refresh = true,
    after?: (value: T) => Promise<void>,
  ): Promise<WriteResult<T>> {
    const result = await this.write(
      request(this.conflicted.has(key) ? latest : seen),
      refresh,
      after,
    );
    if (result.ok) {
      this.conflicted.delete(key);
    } else if (isVersionConflict(result.error)) {
      this.conflicted.add(key);
      await this.refresh();
    }
    return result;
  }

  private versionedNode<T>(
    node: GoalNode,
    request: (version: number) => Observable<T>,
    after?: (value: T) => Promise<void>,
  ): Promise<WriteResult<T>> {
    const latest = this.nodes().find((item) => item.id === node.id)?.version ?? node.version;
    return this.versioned(`node:${node.id}`, node.version, latest, request, true, after);
  }

  private async write<T>(
    request: Observable<T>,
    refresh = true,
    after?: (value: T) => Promise<void>,
  ): Promise<WriteResult<T>> {
    this.writing.set(true);
    try {
      const value = await firstValueFrom(request);
      let followUp: AtlasDataError | null = null;
      if (after) {
        followUp = await after(value).then(
          () => null,
          (error: unknown) => asDataError(error),
        );
      }
      if (refresh) {
        await this.refresh();
      }
      return followUp ? { ok: false, error: followUp } : { ok: true, value };
    } catch (error) {
      return { ok: false, error: asDataError(error) };
    } finally {
      this.writing.set(false);
    }
  }

  private async writeNote<T>(request: Observable<T>): Promise<WriteResult<T>> {
    this.writing.set(true);
    try {
      const value = await firstValueFrom(request);
      this.notesResource.reload();
      return { ok: true, value };
    } catch (error) {
      return { ok: false, error: asDataError(error) };
    } finally {
      this.writing.set(false);
    }
  }

  /** Fetches the backend's new goal, tree and prerequisites, so derived values come from the server. */
  private async refresh(): Promise<void> {
    const goalId = this.goalId();
    if (!goalId) {
      return;
    }
    try {
      const [goal, tree, dependencies] = await Promise.all([
        firstValueFrom(this.repository.get(goalId)),
        firstValueFrom(this.repository.tree(goalId)),
        firstValueFrom(this.repository.dependencies(goalId)),
      ]);
      this.goalResource.set(goal);
      this.treeResource.set(tree);
      this.dependencyResource.set(dependencies);
    } catch {
      this.goalResource.reload();
      this.treeResource.reload();
      this.dependencyResource.reload();
    }
  }

  private missing<T>(): Promise<WriteResult<T>> {
    return Promise.resolve({
      ok: false,
      error: new AtlasDataError('This Destination no longer exists.', 'not-found'),
    });
  }
}
