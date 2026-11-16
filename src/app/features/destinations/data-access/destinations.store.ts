import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { writeFailure, type WriteFailure } from '../../../core/data-access/data-error';
import { GoalRepository } from '../../../core/data-access/ports/goal.repository';
import { ATLAS_SAMPLE_DATA } from '../../../core/data-access/sample-data';
import { ATLAS_SAMPLE_GOAL_DRAFT } from '../../../core/data-access/sample-goal-draft';
import type { Goal, GoalSummary } from '../../../core/models/goal';
import type { GoalDraft } from '../../../core/models/goal-commands';
import {
  DEFAULT_FILTERS,
  isDefault,
  toGoalQuery,
  type DestinationFilters,
} from './destinations.filters';

export type DestinationsState = 'loading' | 'empty' | 'no-results' | 'ready' | 'error';

/**
 * Destinations overview (F2-4): the filtered list and Destination creation (F2-6). Filters come from the URL, so
 * a filtered view can be shared and survives a reload. The list keeps the last results while a new query loads.
 */
@Injectable()
export class DestinationsStore {
  private readonly repository = inject(GoalRepository);
  readonly sample = inject(ATLAS_SAMPLE_DATA);
  readonly sampleDraft = inject(ATLAS_SAMPLE_GOAL_DRAFT);

  readonly filters = signal<DestinationFilters>(DEFAULT_FILTERS);
  /** Year the timeframe filter counts from. */
  readonly year = signal(new Date().getFullYear());
  private visited = false;

  private readonly resource = rxResource({
    params: () => toGoalQuery(this.filters(), this.year()),
    stream: ({ params }) => this.repository.list(params),
  });

  private readonly last = linkedSignal<
    readonly GoalSummary[] | undefined,
    readonly GoalSummary[] | undefined
  >({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (next, previous) => next ?? previous?.value,
  });

  readonly destinations = computed<readonly GoalSummary[]>(() => this.last() ?? []);
  readonly searching = computed(() => this.resource.isLoading() && this.last() !== undefined);

  readonly state = computed<DestinationsState>(() => {
    if (this.resource.status() === 'error') {
      return 'error';
    }
    const list = this.last();
    if (!list) {
      return 'loading';
    }
    if (list.length) {
      return 'ready';
    }
    return isDefault(this.filters()) ? 'empty' : 'no-results';
  });

  /** Called when the page opens: a later visit refreshes the list in the background. */
  enter(): void {
    if (this.visited) {
      this.resource.reload();
    }
    this.visited = true;
  }

  retry(): void {
    this.resource.reload();
  }

  /** Creates a Destination; resolves the saved goal or the form's messages. */
  async create(draft: GoalDraft): Promise<{ goal: Goal } | { failure: WriteFailure }> {
    try {
      const goal = await firstValueFrom(this.repository.create(draft));
      this.resource.reload();
      return { goal };
    } catch (error) {
      return { failure: writeFailure(error) };
    }
  }
}
