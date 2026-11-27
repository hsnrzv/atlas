import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Timeline, TimelineItem, TimelineQuery } from '../../models/timeline';
import { TimelineRepository } from '../ports/timeline.repository';
import { mockRead } from './mock-io';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

const inRange = (item: TimelineItem, query: TimelineQuery): boolean =>
  !item.date ||
  ((!query.from || item.date.date >= query.from) && (!query.to || item.date.date <= query.to));

/**
 * Dev-only Journey adapter (F2-8) over the session plan, shaped like `GET /api/v1/timeline` (API-CONTRACT §9.7)
 * with the FQ-14 proposal: undated items are included. The mock filters and orders like the backend would; the
 * frontend never does. Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockTimelineRepository extends TimelineRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);

  timeline(query: TimelineQuery = {}): Observable<Timeline> {
    const key = `timeline:${query.from ?? ''}:${query.to ?? ''}:${query.goalId ?? ''}:${query.nodeType ?? ''}`;
    return mockRead(this.responder, key, () => ({ items: this.items(query) }));
  }

  private items(query: TimelineQuery): TimelineItem[] {
    const goals = this.state.goals.filter(
      (goal) => goal.status !== 'ARCHIVED' && (!query.goalId || goal.id === query.goalId),
    );
    const items = goals.flatMap((goal): TimelineItem[] => [
      ...(query.nodeType
        ? []
        : [
            {
              goalId: goal.id,
              goalTitle: goal.title,
              nodeId: null,
              parentId: null,
              nodeType: null,
              title: goal.title,
              status: goal.status,
              areaKey: goal.primaryAreaKey,
              date: goal.targetDate,
              progress: goal.progress,
            },
          ]),
      ...this.state
        .nodesOf(goal.id)
        .filter((node) => !query.nodeType || node.nodeType === query.nodeType)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((node) => ({
          goalId: goal.id,
          goalTitle: goal.title,
          nodeId: node.id,
          parentId: node.parentId,
          nodeType: node.nodeType,
          title: node.title,
          status: node.status,
          areaKey: goal.primaryAreaKey,
          date: node.dueDate,
          progress: node.progress,
        })),
    ]);
    const filtered = items.filter((item) => inRange(item, query));
    const dated = filtered
      .filter((item) => item.date)
      .sort((a, b) => a.date!.date.localeCompare(b.date!.date));
    return [...dated, ...filtered.filter((item) => !item.date)];
  }
}
