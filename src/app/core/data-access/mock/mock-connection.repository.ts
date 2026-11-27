import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { GoalConnection } from '../../models/connection';
import { ConnectionRepository } from '../ports/connection.repository';
import { mockRead } from './mock-io';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { SAMPLE_GOAL_ID } from './sample-plan';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

/**
 * The sample's illustrative, unverified Finance impact (Figma page 09 Selected relationship). No amount and no
 * period: the frontend never invents money (frontend.md §6.4). Deleted with the mock (F4-7).
 */
export const SAMPLE_FINANCE_IMPACT = {
  title: 'Potential financial effect',
  description:
    'Tuition or study costs could affect Finance. This is a possibility to review, not a predicted outcome.',
  subject: 'Programme / fees',
  subjectConfirmed: false,
  money: null,
  effectiveFrom: null,
  assumptions:
    'Programme choice, fees and funding are still unknown. Confirm these before treating this as a financial commitment.',
} as const;

/**
 * Dev-only Connections adapter (F2-9, FQ-15): one association per Destination with its primary and secondary
 * dimensions, plus the sample's possible Finance impact. Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockConnectionRepository extends ConnectionRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);

  connections(): Observable<readonly GoalConnection[]> {
    return mockRead(this.responder, 'connections', () =>
      this.state.goals
        .filter((goal) => goal.status !== 'ARCHIVED')
        .flatMap((goal): GoalConnection[] => {
          const base = { goalId: goal.id, goalTitle: goal.title, verified: true, impact: null };
          const associations: GoalConnection[] = [
            {
              ...base,
              id: `${goal.id}:${goal.primaryAreaKey}`,
              areaKey: goal.primaryAreaKey,
              kind: 'ASSOCIATION',
              primary: true,
            },
            ...goal.secondaryAreas.map((area) => ({
              ...base,
              id: `${goal.id}:${area.areaKey}`,
              areaKey: area.areaKey,
              kind: 'ASSOCIATION' as const,
              primary: false,
            })),
          ];
          return goal.id === SAMPLE_GOAL_ID
            ? [
                ...associations,
                {
                  id: `${goal.id}:FINANCE:impact`,
                  goalId: goal.id,
                  goalTitle: goal.title,
                  areaKey: 'FINANCE',
                  kind: 'POSSIBLE_IMPACT',
                  primary: false,
                  verified: false,
                  impact: SAMPLE_FINANCE_IMPACT,
                },
              ]
            : associations;
        }),
    );
  }
}
