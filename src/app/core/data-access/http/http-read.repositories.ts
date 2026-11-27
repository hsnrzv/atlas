import { inject, Injectable } from '@angular/core';
import { map, type Observable, switchMap } from 'rxjs';
import type { AwardItem, Awards } from '../../models/awards';
import type { GoalConnection } from '../../models/connection';
import type { Dashboard } from '../../models/dashboard';
import type { Goal } from '../../models/goal';
import type { GoalNode } from '../../models/goal-node';
import type { Onboarding, OnboardingAreas } from '../../models/onboarding';
import type { Timeline, TimelineQuery } from '../../models/timeline';
import { AwardRepository } from '../ports/award.repository';
import { ConnectionRepository } from '../ports/connection.repository';
import { DashboardRepository } from '../ports/dashboard.repository';
import { OnboardingRepository } from '../ports/onboarding.repository';
import { TimelineRepository } from '../ports/timeline.repository';
import type { OnboardingStepRequest, RewardResponse } from './api-types';
import { AtlasApi } from './atlas-api';

/** `GET /api/v1/dashboard` (F4-1). */
@Injectable({ providedIn: 'root' })
export class HttpDashboardRepository extends DashboardRepository {
  private readonly api = inject(AtlasApi);

  dashboard(): Observable<Dashboard> {
    return this.api.get<Dashboard>(['dashboard']);
  }
}

/** `GET /api/v1/timeline?from&to&goalId&nodeType` (API-CONTRACT §9.7). */
@Injectable({ providedIn: 'root' })
export class HttpTimelineRepository extends TimelineRepository {
  private readonly api = inject(AtlasApi);

  timeline(query: TimelineQuery = {}): Observable<Timeline> {
    return this.api.get<Timeline>(['timeline'], { ...query });
  }
}

/** Proposed `GET /api/v1/connections` (FQ-15, deferred to backend Phase 6). */
@Injectable({ providedIn: 'root' })
export class HttpConnectionRepository extends ConnectionRepository {
  private readonly api = inject(AtlasApi);

  connections(): Observable<readonly GoalConnection[]> {
    return this.api.getAll<GoalConnection>(['connections']);
  }
}

/** `GET /api/v1/rewards` (API-CONTRACT §9.7a, FQ-16) and `POST …/reward/redeem` (API-CONTRACT §9.6). */
@Injectable({ providedIn: 'root' })
export class HttpAwardRepository extends AwardRepository {
  private readonly api = inject(AtlasApi);

  awards(): Observable<Awards> {
    return this.api.get<Awards>(['rewards']);
  }

  /**
   * A reward has no version of its own: redeem sends `If-Match` with the `ETag` of its owner, the goal or the node
   * (API-CONTRACT §7, FQ-21). `GET /rewards` carries no versions, so the owner is read first.
   */
  redeem(reward: AwardItem): Observable<AwardItem> {
    const owner = reward.nodeId
      ? ['goals', reward.goalId, 'nodes', reward.nodeId]
      : ['goals', reward.goalId];
    return this.api.get<Goal | GoalNode>(owner).pipe(
      switchMap(({ version }) =>
        this.api.post<RewardResponse>([...owner, 'reward', 'redeem'], null, { version }),
      ),
      map((result) => ({
        ...reward,
        description: result.description,
        status: result.status,
        earnedAt: result.earnedAt ?? reward.earnedAt,
        redeemedAt: result.redeemedAt ?? reward.redeemedAt,
      })),
    );
  }
}

/** `/api/v1/onboarding` (API-CONTRACT §9.3). Every call answers with the whole onboarding state. */
@Injectable({ providedIn: 'root' })
export class HttpOnboardingRepository extends OnboardingRepository {
  private readonly api = inject(AtlasApi);

  onboarding(): Observable<Onboarding> {
    return this.api.get<Onboarding>(['onboarding']);
  }

  saveAreas(areas: OnboardingAreas | null): Observable<Onboarding> {
    const body: OnboardingStepRequest = areas
      ? { status: 'COMPLETED', payload: { areaKeys: areas.areaKeys } }
      : { status: 'SKIPPED', payload: null };
    return this.api.put<Onboarding>(['onboarding', 'steps', 'areas'], body);
  }

  complete(): Observable<Onboarding> {
    return this.api.post<Onboarding>(['onboarding', 'complete'], null);
  }

  reopen(): Observable<Onboarding> {
    return this.api.post<Onboarding>(['onboarding', 'reopen'], null);
  }
}
