import {
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, map, type Observable, of, switchMap, throwError } from 'rxjs';
import type { Goal } from '../../models/goal';
import type { GoalDraft, GoalQuery, GoalSort, NodeDraft } from '../../models/goal-commands';
import type { IkigaiAreaKey } from '../../models/life-dimension';
import type { OnboardingStepRequest } from '../http/api-types';
import { API_BASE_URL } from '../http/api-config';
import type { ProblemDetails } from '../http/problem-details';
import { AtlasDataError } from '../data-error';
import { MockAwardRepository } from '../mock/mock-award.repository';
import { MockConnectionRepository } from '../mock/mock-connection.repository';
import { MockDashboardRepository } from '../mock/mock-dashboard.repository';
import { MockGoalRepository } from '../mock/mock-goal.repository';
import { MockOnboardingRepository } from '../mock/mock-onboarding.repository';
import { MockPlanState } from '../mock/mock-plan-state';
import { MockTimelineRepository } from '../mock/mock-timeline.repository';

type Reply = Observable<{ status: number; body: unknown }>;

/** Request properties the contract accepts per write; anything else is a `400` (API-CONTRACT §5). */
const BODY_KEYS = {
  goal: ['title', 'outcome', 'description', 'primaryAreaKey', 'status', 'targetDate'],
  goalAreas: ['secondaryAreas'],
  node: ['parentId', 'nodeType', 'title', 'outcome', 'description', 'dueDate'],
  nodePatch: ['title', 'outcome', 'description', 'dueDate', 'status', 'parentId', 'sortOrder'],
  dependency: ['prerequisiteNodeId', 'dependentNodeId'],
  note: ['nodeId', 'body'],
  reward: ['description'],
  onboardingStep: ['status', 'payload'],
} as const;

const SORTS: Readonly<Record<string, GoalSort>> = {
  'targetDate,asc': 'targetDate',
  'title,asc': 'title',
  'updatedAt,desc': 'updatedAt',
};

function problem(
  status: number,
  code: string,
  detail: string,
  extra: Partial<ProblemDetails> = {},
): HttpErrorResponse {
  const body: ProblemDetails = {
    type: `urn:problem:atlas:${code}`,
    status,
    code,
    detail,
    ...extra,
  };
  return new HttpErrorResponse({ status, error: body, statusText: code });
}

/** The status and Problem Details the backend would answer an `AtlasDataError` of the mock engine with. */
function toProblem(error: unknown): HttpErrorResponse {
  if (!(error instanceof AtlasDataError)) {
    return problem(500, 'INTERNAL_ERROR', String(error));
  }
  switch (error.reason) {
    case 'network':
      return new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    case 'not-found':
      return problem(404, error.code ?? 'RESOURCE_NOT_FOUND', error.message);
    case 'conflict':
      return problem(
        error.code === 'VERSION_CONFLICT' ? 412 : 409,
        error.code ?? 'CONFLICT',
        error.message,
      );
    case 'validation': {
      const errors = Object.keys(error.fieldErrors).map((field) => ({ field, code: 'Invalid' }));
      return problem(400, error.code ?? 'VALIDATION_FAILED', error.message, { errors });
    }
    case 'unauthorized':
      return problem(403, error.code ?? 'FORBIDDEN', error.message);
    case 'unavailable':
      return problem(503, error.code ?? 'SERVICE_UNAVAILABLE', error.message);
  }
}

class Rejection extends Error {
  constructor(readonly response: HttpErrorResponse) {
    super(response.statusText);
  }
}

const reject = (status: number, code: string, detail: string): never => {
  throw new Rejection(problem(status, code, detail));
};

function checkBody(body: unknown, allowed: readonly string[]): Record<string, unknown> {
  const record = (body ?? {}) as Record<string, unknown>;
  const unknown = Object.keys(record).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    reject(400, 'VALIDATION_FAILED', `Unknown properties: ${unknown.join(', ')}`);
  }
  return record;
}

/** The version of a strong ETag in `If-Match`; `428` when it is missing (API-CONTRACT §6). */
function ifMatch(request: HttpRequest<unknown>): number {
  const header = request.headers.get('If-Match');
  const version = header?.match(/^"(\d+)"$/)?.[1];
  if (version === undefined) {
    return reject(428, 'PRECONDITION_REQUIRED', 'If-Match is required.');
  }
  return Number(version);
}

function query(params: HttpParams, names: readonly string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of names) {
    const value = params.get(name);
    if (value !== null) {
      result[name] = value;
    }
  }
  return result;
}

const ok = (body: unknown, status = 200): Reply => of({ status, body });

/**
 * Spec-only stand-in for the Atlas backend (gate 8): an `HttpBackend` that answers `/api/v1/…` the way
 * API-CONTRACT describes — paginated collections, `If-Match` (`428`/`412`), unknown request properties (`400`),
 * `Idempotency-Key` replay and Problem Details — using the in-memory mock as its engine. Store specs run once
 * against the mock adapters and once against the HTTP adapters talking to this backend, so both adapters must
 * satisfy the same tests. Application code never imports this file.
 */
@Injectable()
export class FakeAtlasApi extends HttpBackend {
  private readonly base = inject(API_BASE_URL);
  private readonly state = inject(MockPlanState);
  private readonly goals = inject(MockGoalRepository);
  private readonly dashboard = inject(MockDashboardRepository);
  private readonly timeline = inject(MockTimelineRepository);
  private readonly connections = inject(MockConnectionRepository);
  private readonly awards = inject(MockAwardRepository);
  private readonly onboarding = inject(MockOnboardingRepository);
  private readonly replays = new Map<string, unknown>();
  /** Every request in order, for specs that check what reached the wire. */
  readonly requests: HttpRequest<unknown>[] = [];

  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.requests.push(request);
    return defer(() => this.route(request)).pipe(
      map(
        ({ status, body }) =>
          new HttpResponse({ status, body: status === 204 ? null : body, url: request.url }),
      ),
      catchError((error: unknown) =>
        throwError(() => (error instanceof Rejection ? error.response : toProblem(error))),
      ),
    );
  }

  private route(request: HttpRequest<unknown>): Reply {
    if (!request.url.startsWith(`${this.base}/`)) {
      return reject(404, 'RESOURCE_NOT_FOUND', request.url);
    }
    const path = request.url
      .slice(this.base.length + 1)
      .split('/')
      .map((segment) => decodeURIComponent(segment));
    const key = request.headers.get('Idempotency-Key');
    const replayKey = key && `${request.method} ${request.url} ${key}`;
    if (replayKey && this.replays.has(replayKey)) {
      return ok(this.replays.get(replayKey), 201);
    }
    const reply = this.dispatch(request, path, `${request.method} ${path.join('/')}`);
    return replayKey
      ? reply.pipe(
          map((result) => {
            this.replays.set(replayKey, result.body);
            return result;
          }),
        )
      : reply;
  }

  private dispatch(request: HttpRequest<unknown>, path: readonly string[], route: string): Reply {
    const [resource, goalId, sub, subId, action, actionTail] = path;
    const params = request.params;
    switch (resource) {
      case 'dashboard':
        return this.read(this.dashboard.dashboard());
      case 'timeline':
        return this.read(
          this.timeline.timeline(query(params, ['from', 'to', 'goalId', 'nodeType'])),
        );
      case 'connections':
        return this.page(this.connections.connections());
      case 'rewards':
        return this.read(this.awards.awards());
      case 'onboarding':
        return this.onboardingRoute(request, path);
    }
    if (resource !== 'goals') {
      return reject(404, 'RESOURCE_NOT_FOUND', route);
    }
    if (goalId === undefined) {
      if (request.method === 'GET') {
        const filters = query(params, ['q', 'status', 'area', 'targetFrom', 'targetTo']);
        const goalQuery = { ...filters, sort: SORTS[params.get('sort') ?? ''] } as GoalQuery;
        return this.page(this.goals.list(goalQuery));
      }
      if (request.method === 'POST') {
        const body = checkBody(request.body, BODY_KEYS.goal);
        return this.created(this.goals.create({ ...body, reward: null } as unknown as GoalDraft));
      }
    }
    if (sub === undefined) {
      switch (request.method) {
        case 'GET':
          return this.read(this.goals.get(goalId));
        case 'PATCH': {
          const version = ifMatch(request);
          const body = request.body as Record<string, unknown>;
          if (body && 'secondaryAreas' in body) {
            checkBody(body, BODY_KEYS.goalAreas);
            return this.read(
              this.goals.setSecondaryAreas(goalId, version, body['secondaryAreas'] as never),
            );
          }
          checkBody(body, BODY_KEYS.goal);
          return this.read(
            this.goals.update(goalId, version, {
              ...(body as unknown as GoalDraft),
              reward: this.state.goal(goalId).reward?.description ?? null,
            }),
          );
        }
        case 'DELETE':
          return this.empty(this.goals.remove(goalId, ifMatch(request)));
      }
    }
    switch (sub) {
      case 'tree':
        return this.read(this.goals.tree(goalId));
      case 'archive':
        return this.read(this.goals.archive(goalId, ifMatch(request)));
      case 'reward':
        return subId === 'redeem'
          ? this.redeem(goalId, null)
          : this.reward(request, this.state.goal(goalId));
      case 'nodes':
        return this.nodeRoute(request, goalId, subId, action, actionTail);
      case 'dependencies':
        if (request.method === 'GET') {
          return this.read(this.goals.dependencies(goalId));
        }
        if (request.method === 'POST') {
          const body = checkBody(request.body, BODY_KEYS.dependency);
          return this.created(
            this.goals.addDependency(
              goalId,
              body['prerequisiteNodeId'] as string,
              body['dependentNodeId'] as string,
            ),
          );
        }
        return this.empty(this.goals.removeDependency(goalId, subId));
      case 'notes':
        switch (request.method) {
          case 'GET':
            return this.page(this.goals.notes(goalId, params.get('nodeId')));
          case 'POST': {
            const body = checkBody(request.body, BODY_KEYS.note);
            return this.created(
              this.goals.addNote(
                goalId,
                (body['nodeId'] as string | null) ?? null,
                body['body'] as string,
              ),
            );
          }
          case 'PATCH': {
            const body = checkBody(request.body, BODY_KEYS.note);
            return this.read(this.goals.updateNote(goalId, subId, body['body'] as string));
          }
          case 'DELETE':
            return this.empty(this.goals.removeNote(goalId, subId));
        }
    }
    return reject(404, 'RESOURCE_NOT_FOUND', route);
  }

  private nodeRoute(
    request: HttpRequest<unknown>,
    goalId: string,
    nodeId: string | undefined,
    action: string | undefined,
    actionTail: string | undefined,
  ): Reply {
    if (nodeId === undefined) {
      const body = checkBody(request.body, BODY_KEYS.node);
      return this.created(this.goals.createNode(goalId, body as unknown as NodeDraft));
    }
    switch (action) {
      case 'complete':
        return this.read(this.goals.completeNode(goalId, nodeId, ifMatch(request)));
      case 'reopen':
        return this.read(this.goals.reopenNode(goalId, nodeId, ifMatch(request)));
      case 'reward':
        if (actionTail === 'redeem') {
          return this.redeem(goalId, nodeId);
        }
        break;
      case undefined:
        if (request.method === 'PATCH') {
          const body = checkBody(request.body, BODY_KEYS.nodePatch);
          return this.read(this.goals.updateNode(goalId, nodeId, ifMatch(request), body));
        }
        if (request.method === 'DELETE') {
          const cascade = request.params.get('cascade') === 'true';
          return this.empty(this.goals.removeNode(goalId, nodeId, ifMatch(request), cascade));
        }
    }
    return reject(404, 'RESOURCE_NOT_FOUND', `${request.method} node ${action ?? ''}`);
  }

  /** `PUT`/`DELETE /goals/{id}/reward`, guarded by the goal's version (FQ-21). */
  private reward(request: HttpRequest<unknown>, goal: Goal): Reply {
    const version = ifMatch(request);
    const description =
      request.method === 'PUT'
        ? (checkBody(request.body, BODY_KEYS.reward)['description'] as string)
        : null;
    const draft: GoalDraft = { ...goal, reward: description };
    return this.goals
      .update(goal.id, version, draft)
      .pipe(map((updated) => ({ status: description ? 200 : 204, body: updated.reward })));
  }

  private redeem(goalId: string, nodeId: string | null): Reply {
    return this.awards.awards().pipe(
      switchMap((awards) => {
        const item = awards.rewards.find(
          (reward) => reward.goalId === goalId && reward.nodeId === nodeId,
        );
        return item
          ? this.read(this.awards.redeem(item))
          : reject(404, 'RESOURCE_NOT_FOUND', 'reward');
      }),
    );
  }

  private onboardingRoute(request: HttpRequest<unknown>, path: readonly string[]): Reply {
    switch (`${request.method} ${path.slice(1).join('/')}`) {
      case 'GET ':
        return this.read(this.onboarding.onboarding());
      case 'PUT steps/areas': {
        const body = checkBody(
          request.body,
          BODY_KEYS.onboardingStep,
        ) as unknown as OnboardingStepRequest;
        return this.read(
          this.onboarding.saveAreas(
            body.status === 'COMPLETED'
              ? { areaKeys: (body.payload?.areaKeys ?? []) as readonly IkigaiAreaKey[] }
              : null,
          ),
        );
      }
      case 'POST complete':
        return this.read(this.onboarding.complete());
      case 'POST reopen':
        return this.read(this.onboarding.reopen());
    }
    return reject(404, 'RESOURCE_NOT_FOUND', path.join('/'));
  }

  private read(source: Observable<unknown>): Reply {
    return source.pipe(map((body) => ({ status: 200, body })));
  }

  private created(source: Observable<unknown>): Reply {
    return source.pipe(map((body) => ({ status: 201, body })));
  }

  private empty(source: Observable<unknown>): Reply {
    return source.pipe(map(() => ({ status: 204, body: null })));
  }

  /** A whole collection as one contract page (the fake never holds more than a page). */
  private page(source: Observable<readonly unknown[]>): Reply {
    return source.pipe(
      map((content) => ({
        status: 200,
        body: {
          content,
          page: { size: 100, number: 0, totalElements: content.length, totalPages: 1 },
        },
      })),
    );
  }
}
