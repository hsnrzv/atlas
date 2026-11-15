import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { failureOf, GoalPlanStore, messageOf } from '../data-access/goal-plan.store';
import type { GoalNode, NodeId } from '../models/goal-node';
import { descendantIds, findNode } from '../models/goal-tree';
import { openConfirm } from '../../shared/ui/confirm-dialog/confirm-dialog';
import {
  openNodeForm,
  type NodeFormType,
  type NodeFormValue,
} from '../../shared/ui/node-form-dialog/node-form-dialog';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { nodeKind } from '../../shared/utils/plan-format';

/**
 * Waypoint and Step editing for every plan page (F3-2): the form dialog, delete confirmation, reorder and the
 * Saved toast. Features never import each other, so this lives in core; provide it next to `GoalPlanStore`.
 */
@Injectable()
export class PlanEditor {
  private readonly store = inject(GoalPlanStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(AtlasToast);

  /** The last failed delete or move, shown by the page in an alert until the next success or `dismiss()`. */
  readonly error = signal<string | null>(null);

  dismiss(): void {
    this.error.set(null);
  }

  /** Adds a Waypoint or Step under `parentId` (the Destination when `null`). Resolves `true` when saved. */
  async add(parentId: NodeId | null, nodeType: NodeFormType): Promise<boolean> {
    const nodes = this.store.nodes();
    const parent = parentId ? findNode(nodes, parentId) : null;
    const saved = await openNodeForm(this.dialog, {
      mode: 'create',
      initial: {
        nodeType,
        title: '',
        outcome: null,
        description: null,
        dueDate: null,
        prerequisites: [],
      },
      context: `In ${parent?.title ?? this.store.goal()?.title ?? 'this Destination'}`,
      prerequisiteOptions: nodes.map(({ id, title }) => ({ id, title })),
      save: async ({ prerequisites, ...draft }: NodeFormValue) =>
        failureOf(await this.store.createNode({ ...draft, parentId }, prerequisites)),
    });
    if (saved) {
      this.toast.show(`${nodeType === 'TASK' ? 'Step' : 'Waypoint'} added.`);
    }
    return saved;
  }

  async edit(node: GoalNode): Promise<boolean> {
    const nodes = this.store.nodes();
    const parent = node.parentId ? findNode(nodes, node.parentId) : null;
    const excluded = descendantIds(nodes, node.id);
    const saved = await openNodeForm(this.dialog, {
      mode: 'edit',
      initial: {
        nodeType: node.nodeType === 'TASK' ? 'TASK' : 'MILESTONE',
        title: node.title,
        outcome: node.outcome,
        description: node.description,
        dueDate: node.dueDate,
        prerequisites: this.store.prerequisitesOf(node.id),
      },
      context: `In ${parent?.title ?? this.store.goal()?.title ?? 'this Destination'}`,
      prerequisiteOptions: nodes
        .filter((item) => item.id !== node.id && !excluded.has(item.id))
        .map(({ id, title }) => ({ id, title })),
      save: async ({ prerequisites, title, outcome, description, dueDate }: NodeFormValue) =>
        failureOf(
          await this.store.updateNode(
            node,
            { title, outcome, description, dueDate },
            prerequisites,
          ),
        ),
    });
    if (saved) {
      this.toast.show(`${nodeKind(node)} saved.`);
    }
    return saved;
  }

  /** Confirms, then deletes the node and, when it has any, its children. Resolves `true` when deleted. */
  async remove(node: GoalNode): Promise<boolean> {
    const kind = nodeKind(node);
    const children = descendantIds(this.store.nodes(), node.id).size;
    const confirmed = await openConfirm(this.dialog, {
      title: `Delete ${kind}?`,
      message: children
        ? `${node.title} and the ${children} Waypoints and Steps inside it will be deleted. This cannot be undone.`
        : `${node.title} will be deleted. This cannot be undone.`,
      confirmLabel: `Delete ${kind}`,
      destructive: true,
    });
    if (!confirmed) {
      return false;
    }
    return this.settle(
      messageOf(await this.store.removeNode(node, children > 0)),
      `${kind} deleted.`,
    );
  }

  async move(node: GoalNode, direction: -1 | 1): Promise<void> {
    this.settle(
      messageOf(await this.store.moveNode(node, direction)),
      `${node.title} moved ${direction < 0 ? 'up' : 'down'}.`,
    );
  }

  /** Shows the outcome of a write: the error in the page alert, or a success toast. Resolves `true` on success. */
  settle(error: string | null, success: string): boolean {
    this.error.set(error);
    if (!error) {
      this.toast.show(success);
    }
    return !error;
  }
}
