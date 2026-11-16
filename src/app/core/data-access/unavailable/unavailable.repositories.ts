import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import type { AwardItem, Awards } from '../../models/awards';
import type { GoalConnection } from '../../models/connection';
import type { Dashboard } from '../../models/dashboard';
import type { Goal, GoalSummary } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type { GoalNode, GoalTree } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import type { Onboarding } from '../../models/onboarding';
import type { Timeline } from '../../models/timeline';
import { AtlasDataError } from '../data-error';
import { AwardRepository } from '../ports/award.repository';
import { ConnectionRepository } from '../ports/connection.repository';
import { DashboardRepository } from '../ports/dashboard.repository';
import { GoalRepository } from '../ports/goal.repository';
import { OnboardingRepository } from '../ports/onboarding.repository';
import { TimelineRepository } from '../ports/timeline.repository';

function unavailable<T>(): Observable<T> {
  return throwError(
    () => new AtlasDataError('The Atlas service is not connected yet (F4-1).', 'unavailable'),
  );
}

/**
 * Production stand-in until the HTTP adapters land (F4-1). Every call fails, so pages show their Error state and
 * the production bundle carries no sample data.
 */
@Injectable()
export class UnavailableDashboardRepository extends DashboardRepository {
  dashboard(): Observable<Dashboard> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableGoalRepository extends GoalRepository {
  list(): Observable<readonly GoalSummary[]> {
    return unavailable();
  }

  get(): Observable<Goal> {
    return unavailable();
  }

  tree(): Observable<GoalTree> {
    return unavailable();
  }

  create(): Observable<Goal> {
    return unavailable();
  }

  update(): Observable<Goal> {
    return unavailable();
  }

  archive(): Observable<Goal> {
    return unavailable();
  }

  remove(): Observable<void> {
    return unavailable();
  }

  createNode(): Observable<GoalNode> {
    return unavailable();
  }

  updateNode(): Observable<GoalNode> {
    return unavailable();
  }

  removeNode(): Observable<void> {
    return unavailable();
  }

  completeNode(): Observable<GoalNode> {
    return unavailable();
  }

  reopenNode(): Observable<GoalNode> {
    return unavailable();
  }

  dependencies(): Observable<readonly GoalDependency[]> {
    return unavailable();
  }

  addDependency(): Observable<GoalDependency> {
    return unavailable();
  }

  removeDependency(): Observable<void> {
    return unavailable();
  }

  notes(): Observable<readonly GoalNote[]> {
    return unavailable();
  }

  addNote(): Observable<GoalNote> {
    return unavailable();
  }

  updateNote(): Observable<GoalNote> {
    return unavailable();
  }

  removeNote(): Observable<void> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableTimelineRepository extends TimelineRepository {
  timeline(): Observable<Timeline> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableConnectionRepository extends ConnectionRepository {
  connections(): Observable<readonly GoalConnection[]> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableAwardRepository extends AwardRepository {
  awards(): Observable<Awards> {
    return unavailable();
  }

  redeem(): Observable<AwardItem> {
    return unavailable();
  }
}

@Injectable()
export class UnavailableOnboardingRepository extends OnboardingRepository {
  onboarding(): Observable<Onboarding> {
    return unavailable();
  }

  saveAreas(): Observable<Onboarding> {
    return unavailable();
  }

  complete(): Observable<Onboarding> {
    return unavailable();
  }

  reopen(): Observable<Onboarding> {
    return unavailable();
  }
}
