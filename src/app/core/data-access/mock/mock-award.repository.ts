import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AchievedWaypoint, AwardItem, Awards } from '../../models/awards';
import type { RewardStatus } from '../../models/goal';
import { AtlasDataError } from '../data-error';
import { AwardRepository } from '../ports/award.repository';
import { SAMPLE_COMPLETION_TIMES } from './mock-dashboard.repository';
import { mockRead, mockWrite } from './mock-io';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

/**
 * Dev-only Milestone Awards adapter (F2-9, FQ-16): the rewards set on the session's Destinations and Waypoints and
 * the Waypoints whose status the backend reports as completed. Counts come from the stored statuses; the mock does
 * not earn rewards on its own (that rule belongs to the backend). Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockAwardRepository extends AwardRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);
  /** `redeemedAt` of rewards redeemed in this session, by `goalId:nodeId`. */
  private readonly redeemed = new Map<string, string>();

  awards(): Observable<Awards> {
    return mockRead(this.responder, 'awards', () => this.read());
  }

  redeem(reward: AwardItem): Observable<AwardItem> {
    return mockWrite(this.responder, this.state, () => {
      const current = this.read().rewards.find(
        (item) => item.goalId === reward.goalId && item.nodeId === reward.nodeId,
      );
      if (!current) {
        throw new AtlasDataError('This Milestone Award no longer exists.', 'not-found');
      }
      if (current.status !== 'EARNED') {
        throw new AtlasDataError('Only an earned Milestone Award can be redeemed.', 'conflict', {
          code: 'REWARD_NOT_EARNED',
        });
      }
      const redeemedAt = this.state.now();
      this.redeemed.set(`${reward.goalId}:${reward.nodeId ?? ''}`, redeemedAt);
      this.setStatus(current, 'REDEEMED');
      return { ...current, status: 'REDEEMED' as const, redeemedAt };
    });
  }

  private read(): Awards {
    const goals = this.state.goals.filter((goal) => !this.state.archived.has(goal.id));
    const rewards: AwardItem[] = [];
    const achievedWaypoints: AchievedWaypoint[] = [];
    for (const goal of goals) {
      const nodes = this.state.nodesOf(goal.id);
      const item = (
        nodeId: string | null,
        sourceTitle: string,
        description: string,
        status: RewardStatus,
      ): AwardItem => ({
        goalId: goal.id,
        nodeId,
        sourceTitle,
        areaKey: goal.primaryAreaKey,
        description,
        status,
        earnedAt: status === 'PLANNED' ? null : (SAMPLE_COMPLETION_TIMES[nodeId ?? ''] ?? null),
        redeemedAt: this.redeemed.get(`${goal.id}:${nodeId ?? ''}`) ?? null,
      });
      if (goal.reward) {
        rewards.push(item(null, goal.title, goal.reward.description, goal.reward.status));
      }
      for (const node of nodes) {
        if (node.reward) {
          rewards.push(item(node.id, node.title, node.reward.description, node.reward.status));
        }
        if (node.nodeType !== 'TASK' && node.status === 'COMPLETED') {
          achievedWaypoints.push({
            goalId: goal.id,
            nodeId: node.id,
            title: node.title,
            areaKey: goal.primaryAreaKey,
            completedAt: SAMPLE_COMPLETION_TIMES[node.id] ?? null,
            progress: node.progress,
          });
        }
      }
    }
    const count = (status: RewardStatus) => rewards.filter((r) => r.status === status).length;
    return {
      summary: { earned: count('EARNED'), planned: count('PLANNED'), redeemed: count('REDEEMED') },
      rewards,
      achievedWaypoints,
    };
  }

  private setStatus(reward: AwardItem, status: RewardStatus): void {
    if (reward.nodeId) {
      const node = this.state.node(reward.goalId, reward.nodeId);
      this.state.replaceNode({ ...node, reward: node.reward && { ...node.reward, status } });
    } else {
      const goal = this.state.goal(reward.goalId);
      this.state.replaceGoal({ ...goal, reward: goal.reward && { ...goal.reward, status } });
    }
  }
}
