import { Component, computed, input } from '@angular/core';
import { AtlasIcon } from '../../icons/atlas-icon';
import type { AtlasIconName } from '../../icons/atlas-icons';
import { AtlasSkeleton } from '../skeleton/skeleton';

export type AtlasFeedbackKind = 'empty' | 'loading' | 'error' | 'success';

const ICONS: Record<Exclude<AtlasFeedbackKind, 'loading'>, AtlasIconName> = {
  empty: 'destinations',
  error: 'alert',
  success: 'check',
};

/**
 * Empty, loading, error and success panels (Figma Atlas/V3/FeedbackState 152:6913). Errors are announced as
 * alerts, the other kinds as polite status messages. Project an optional action button.
 */
@Component({
  selector: 'atlas-feedback-state',
  imports: [AtlasIcon, AtlasSkeleton],
  template: `
    @if (kind() === 'loading') {
      <p class="atlas-visually-hidden">{{ title() }}</p>
      <atlas-skeleton [lines]="3" />
    } @else {
      <atlas-icon class="icon" [name]="icon()" size="lg" />
      <h2 class="title">{{ title() }}</h2>
      @if (description(); as description) {
        <p class="description">{{ description }}</p>
      }
      <div class="action">
        <ng-content />
      </div>
    }
  `,
  styleUrl: './feedback-state.scss',
  host: {
    '[attr.role]': 'kind() === "error" ? "alert" : "status"',
    '[attr.aria-busy]': 'kind() === "loading" || null',
    '[attr.data-kind]': 'kind()',
  },
})
export class AtlasFeedbackState {
  readonly kind = input<AtlasFeedbackKind>('empty');
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Overrides the default icon of the kind. */
  readonly iconName = input<AtlasIconName>();

  protected readonly icon = computed(() => {
    const kind = this.kind();
    return this.iconName() ?? (kind === 'loading' ? 'loading' : ICONS[kind]);
  });
}
