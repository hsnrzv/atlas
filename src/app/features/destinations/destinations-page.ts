import { Component, computed, effect, inject, input, type OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { destinationLink } from '../../core/layout/plan-links';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDestinationCard } from '../../shared/ui/destination-card/destination-card';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasIconButton } from '../../shared/ui/icon-button/icon-button';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasSearchField } from '../../shared/ui/search-field/search-field';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { EMPTY_GOAL_DRAFT, openGoalForm } from './components/goal-form-dialog/goal-form-dialog';
import {
  countText,
  DEFAULT_FILTERS,
  DIMENSION_OPTIONS,
  filterParams,
  parseFilters,
  parseView,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
  type DestinationFilters,
  type DestinationsView,
} from './data-access/destinations.filters';
import type { IkigaiAreaKey } from '../../core/models/life-dimension';
import { DestinationsStore } from './data-access/destinations.store';
import { toDestinationCard, toDestinationContext } from './data-access/destinations.view-model';

/** Destinations overview (F2-4, Figma page 06): search, filters, grid or list view, and create (F2-6). */
@Component({
  selector: 'atlas-destinations-page',
  imports: [
    AtlasDestinationCard,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasIconButton,
    AtlasPageHeader,
    AtlasSearchField,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  templateUrl: './destinations-page.html',
  styleUrl: './destinations-page.scss',
})
export class DestinationsPage implements OnInit {
  // Bound from the query string (withComponentInputBinding).
  readonly q = input<string>();
  readonly dimension = input<string>();
  readonly status = input<string>();
  readonly timeframe = input<string>();
  readonly sort = input<string>();
  readonly view = input<string>();
  /** `?create=CAREER` opens "Create destination" with that Life Dimension (Life Dimensions "Add intention"). */
  readonly create = input<string>();

  protected readonly store = inject(DestinationsStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(AtlasToast);

  protected readonly dimensionOptions = DIMENSION_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly timeframeOptions = TIMEFRAME_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly filters = computed(() =>
    parseFilters({
      q: this.q(),
      dimension: this.dimension(),
      status: this.status(),
      timeframe: this.timeframe(),
      sort: this.sort(),
    }),
  );
  protected readonly layout = computed<DestinationsView>(() => parseView(this.view()));
  protected readonly cards = computed(() => this.store.destinations().map(toDestinationCard));
  protected readonly context = computed(() => {
    const first = this.store.destinations()[0];
    return first ? toDestinationContext(first) : null;
  });
  protected readonly count = computed(() =>
    countText(this.store.destinations().length, this.store.filters()),
  );
  protected readonly description = computed(() =>
    this.store.sample
      ? 'Sample plan · changes stay in this browser session.'
      : 'The places your life is moving toward.',
  );

  constructor() {
    effect(() => this.store.filters.set(this.filters()));
    keepHeadingFocus(this.store.state);
  }

  protected setFilter<K extends keyof DestinationFilters>(
    key: K,
    value: DestinationFilters[K],
  ): void {
    this.navigate(filterParams({ ...this.filters(), [key]: value }));
  }

  protected clearFilters(): void {
    this.navigate(filterParams({ ...DEFAULT_FILTERS, sort: this.filters().sort }));
  }

  protected setView(view: DestinationsView): void {
    this.navigate({ view: view === 'grid' ? null : view });
  }

  ngOnInit(): void {
    const create = this.create();
    if (create === undefined) {
      return;
    }
    this.navigate({ create: null });
    const area = DIMENSION_OPTIONS.find((option) => option.value && option.value === create)?.value;
    void this.add(area || undefined);
  }

  protected async add(area?: IkigaiAreaKey): Promise<void> {
    let created: string | null = null;
    const saved = await openGoalForm(this.dialog, {
      mode: 'create',
      initial: EMPTY_GOAL_DRAFT,
      area,
      sample: this.store.sampleDraft,
      save: async (draft) => {
        const result = await this.store.create(draft);
        if ('failure' in result) {
          return result.failure;
        }
        created = result.goal.id;
        return null;
      },
    });
    if (saved && created) {
      this.toast.show('Destination created.');
      await this.router.navigateByUrl(destinationLink(created));
    }
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
