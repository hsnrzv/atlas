import type { GoalConnection } from '../../../core/models/connection';
import type { GoalSummary } from '../../../core/models/goal';
import type { IkigaiAreaKey } from '../../../core/models/life-dimension';
import { lifeDimensionByApiKey } from '../../../shared/design-system/life-dimensions';
import type { LifeDimensionKey } from '../../../shared/design-system/tokens.generated';
import type { AtlasIconName } from '../../../shared/icons/atlas-icons';
import { formatMoney } from '../../../shared/utils/money-format';
import { goalStatusBadge, plannedDateText } from '../../../shared/utils/plan-format';
import { formatPercent, progressDetail } from '../../../shared/utils/progress-format';
import type {
  ConnectionGraphEdge,
  ConnectionGraphNode,
} from '../../../shared/visualization/connection-graph/connection-graph';

export type RelationshipFilter = 'all' | 'association' | 'impact';

export interface ConnectionsFilters {
  readonly relationship: RelationshipFilter;
  /** API key of a Life Dimension, or `null` for all. */
  readonly dimension: IkigaiAreaKey | null;
}

export interface RelationshipFactVm {
  readonly label: string;
  readonly value: string;
}

export interface RelationshipVm {
  readonly id: string;
  readonly goalTitle: string;
  readonly goalLink: string;
  readonly goalNode: string;
  readonly dimensionNode: string;
  readonly dimension: {
    readonly key: LifeDimensionKey;
    readonly label: string;
    readonly icon: AtlasIconName;
  };
  readonly line: 'solid' | 'dashed';
  /** "Primary assignment · association", "Possible impact · illustrative / unverified". */
  readonly kindLabel: string;
  /** Panel heading: "Primary assignment" or the impact title. */
  readonly title: string;
  readonly unverified: boolean;
  readonly summary: string;
  readonly facts: readonly RelationshipFactVm[];
  readonly assumptions: string | null;
}

export interface GoalContextVm {
  readonly id: string;
  readonly title: string;
  readonly link: string;
  readonly line: string;
}

export interface ConnectionsVm {
  readonly heading: string;
  readonly nodes: readonly ConnectionGraphNode[];
  readonly edges: readonly ConnectionGraphEdge[];
  readonly relationships: readonly RelationshipVm[];
  readonly dimensionOptions: readonly { readonly value: IkigaiAreaKey; readonly label: string }[];
  /** Panel text while nothing is selected. */
  readonly noSelection: string;
  readonly contexts: readonly GoalContextVm[];
  /** Relationships exist, but the filters hide all of them. */
  readonly filteredOut: boolean;
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

/** "One destination", "Two relationships", "12 relationships". */
export function countPhrase(count: number, noun: string): string {
  const number = WORDS[count] ?? String(count);
  return `${number} ${noun}${count === 1 ? '' : 's'}`;
}

export const goalNodeId = (goalId: string) => `goal:${goalId}`;
export const dimensionNodeId = (areaKey: string) => `area:${areaKey}`;

function matches(connection: GoalConnection, filters: ConnectionsFilters): boolean {
  const kind =
    filters.relationship === 'all' ||
    (filters.relationship === 'association') === (connection.kind === 'ASSOCIATION');
  return kind && (filters.dimension === null || filters.dimension === connection.areaKey);
}

function kindLabel(connection: GoalConnection): string {
  if (connection.kind === 'ASSOCIATION') {
    return `${connection.primary ? 'Primary' : 'Secondary'} assignment · association`;
  }
  return `Possible impact · ${connection.verified ? 'confirmed' : 'illustrative / unverified'}`;
}

function toRelationship(connection: GoalConnection, locale: string): RelationshipVm | null {
  const dimension = lifeDimensionByApiKey(connection.areaKey);
  if (!dimension) {
    return null;
  }
  const base = {
    id: connection.id,
    goalTitle: connection.goalTitle,
    goalLink: `/destinations/${connection.goalId}`,
    goalNode: goalNodeId(connection.goalId),
    dimensionNode: dimensionNodeId(connection.areaKey),
    dimension: { key: dimension.key, label: dimension.label, icon: dimension.icon },
    kindLabel: kindLabel(connection),
    unverified: !connection.verified,
  };
  const impact = connection.impact;
  if (connection.kind === 'ASSOCIATION' || !impact) {
    return {
      ...base,
      line: connection.kind === 'ASSOCIATION' ? 'solid' : 'dashed',
      title: connection.primary ? 'Primary assignment' : 'Secondary assignment',
      summary: connection.primary
        ? `This destination is assigned to ${dimension.label}. An association does not guarantee a ${dimension.label.toLowerCase()} outcome.`
        : `This destination is also assigned to ${dimension.label}. An association does not guarantee an outcome.`,
      facts: [],
      assumptions: null,
    };
  }
  return {
    ...base,
    line: 'dashed',
    title: impact.title,
    summary: impact.description,
    facts: [
      ...(impact.subject
        ? [
            {
              label: impact.subject,
              value: impact.subjectConfirmed ? 'Confirmed' : 'Not confirmed',
            },
          ]
        : []),
      {
        label: 'Amount',
        value: impact.money ? formatMoney(impact.money, locale) : 'No amount provided',
      },
      {
        label: 'Period',
        value: impact.effectiveFrom ? plannedDateText(impact.effectiveFrom, locale) : 'Not set',
      },
    ],
    assumptions: impact.assumptions,
  };
}

function noSelection(relationships: readonly RelationshipVm[], goals: number): string {
  if (!relationships.length) {
    return 'No relationship to show with these filters.';
  }
  if (goals > 1) {
    return 'No relationship selected. Select a Destination or Life Dimension to read its relationships.';
  }
  const parts = relationships.map((item) => {
    if (item.line === 'solid') {
      return `${item.dimension.label} is ${item.title.startsWith('Primary') ? 'the primary' : 'a secondary'} assignment`;
    }
    return `${item.dimension.label} is ${item.unverified ? 'an unverified' : 'a confirmed'} possible impact`;
  });
  return `No relationship selected. ${parts.join('; ')}.`;
}

export function toConnectionsVm(
  connections: readonly GoalConnection[],
  goals: readonly GoalSummary[],
  filters: ConnectionsFilters,
  locale: string,
): ConnectionsVm {
  const all = connections
    .map((connection) => ({ connection, vm: toRelationship(connection, locale) }))
    .filter((item): item is { connection: GoalConnection; vm: RelationshipVm } => item.vm !== null);
  const visible = all.filter((item) => matches(item.connection, filters));
  const relationships = visible.map((item) => item.vm);
  const byGoal = new Map(goals.map((goal) => [goal.id, goal]));

  const goalIds = [...new Set(visible.map((item) => item.connection.goalId))];
  const areaKeys = [...new Set(visible.map((item) => item.connection.areaKey))];

  const sourceNodes = goalIds.map((goalId): ConnectionGraphNode => {
    const title = visible.find((item) => item.connection.goalId === goalId)!.connection.goalTitle;
    const goal = byGoal.get(goalId);
    const count = visible.filter((item) => item.connection.goalId === goalId).length;
    return {
      id: goalNodeId(goalId),
      column: 'source',
      label: goal ? `${title} · ${formatPercent(goal.progress, locale)}` : title,
      caption: 'Destination',
      icon: 'destinations',
      dimension: null,
      accessibleName: `${title}, Destination, ${countPhrase(count, 'relationship').toLowerCase()}`,
    };
  });
  const targetNodes = areaKeys.map((areaKey): ConnectionGraphNode => {
    const dimension = lifeDimensionByApiKey(areaKey)!;
    const count = visible.filter((item) => item.connection.areaKey === areaKey).length;
    return {
      id: dimensionNodeId(areaKey),
      column: 'target',
      label: dimension.label,
      caption: dimension.longLabel,
      icon: dimension.icon,
      dimension: dimension.key,
      accessibleName: `${dimension.label}, ${countPhrase(count, 'relationship').toLowerCase()}`,
    };
  });

  const dimensionOptions = [...new Set(all.map((item) => item.connection.areaKey))].map(
    (value) => ({
      value,
      label: lifeDimensionByApiKey(value)!.label,
    }),
  );

  const contexts = [...new Set(all.map((item) => item.connection.goalId))].flatMap(
    (goalId): GoalContextVm[] => {
      const goal = byGoal.get(goalId);
      if (!goal) {
        return [];
      }
      const detail = progressDetail(goal.progress);
      const dimension = lifeDimensionByApiKey(goal.primaryAreaKey)?.label;
      const parts = [
        goalStatusBadge(goal.status).label,
        dimension,
        formatPercent(goal.progress, locale),
        detail ? `${detail} steps complete` : null,
        goal.targetDate ? `Target: ${plannedDateText(goal.targetDate, locale)}` : null,
      ];
      return [
        {
          id: goal.id,
          title: goal.title,
          link: `/destinations/${goal.id}`,
          line: parts.filter(Boolean).join(' · '),
        },
      ];
    },
  );

  return {
    heading: `${countPhrase(goalIds.length, 'destination')}. ${countPhrase(relationships.length, 'relationship')}.`,
    nodes: [...sourceNodes, ...targetNodes],
    edges: visible.map(({ connection, vm }) => ({
      id: connection.id,
      source: vm.goalNode,
      target: vm.dimensionNode,
      line: vm.line,
    })),
    relationships,
    dimensionOptions,
    noSelection: noSelection(relationships, goalIds.length),
    contexts,
    filteredOut: all.length > 0 && relationships.length === 0,
  };
}

/** Relationships touching the selected graph node, for the details panel. */
export function selectedRelationships(
  vm: ConnectionsVm,
  selected: string | null,
): readonly RelationshipVm[] {
  if (!selected) {
    return [];
  }
  return vm.relationships.filter(
    (item) => item.goalNode === selected || item.dimensionNode === selected,
  );
}

/** "Finance" or the Destination title, for the panel eyebrow. */
export function selectedLabel(vm: ConnectionsVm, selected: string | null): string | null {
  const goal = vm.relationships.find((item) => item.goalNode === selected);
  return goal?.goalTitle ?? vm.nodes.find((node) => node.id === selected)?.label ?? null;
}
