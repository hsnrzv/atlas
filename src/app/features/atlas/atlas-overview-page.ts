import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CompanionPreferencesStore } from '../../core/companion/companion-preferences.store';
import { DESTINATIONS } from '../../core/layout/navigation';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasCompanionCard } from '../../shared/ui/companion-card/companion-card';
import { AtlasDimensionCard } from '../../shared/ui/dimension-card/dimension-card';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasNextWaypointCard } from '../../shared/ui/next-waypoint-card/next-waypoint-card';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasGlanceSummary } from './components/glance-summary/glance-summary';
import { AtlasHero } from './components/hero/atlas-hero';
import { AtlasOverviewStore } from './data-access/atlas-overview.store';

/** My Atlas (F2-3b, Figma page 05): Overview, Empty, Loading and Error. */
@Component({
  selector: 'atlas-overview-page',
  imports: [
    AtlasCompanionCard,
    AtlasDimensionCard,
    AtlasFeedbackState,
    AtlasGlanceSummary,
    AtlasHero,
    AtlasIcon,
    AtlasNextWaypointCard,
    AtlasPageHeader,
    AtlasProgress,
    MatButton,
    RouterLink,
  ],
  templateUrl: './atlas-overview-page.html',
  styleUrl: './atlas-overview-page.scss',
})
export class AtlasOverviewPage implements OnInit {
  protected readonly store = inject(AtlasOverviewStore);
  protected readonly destinations = DESTINATIONS;
  protected readonly skeletonPanels = [1, 2, 3, 4, 5, 6];
  protected readonly companion = inject(CompanionPreferencesStore);
  /** The optional "next step" companion (P-C1), unless it is off or dismissed this session. */
  protected readonly companionMode = computed(() => {
    const mode = this.companion.mode();
    return mode !== 'off' && this.companion.shows('next-step') ? mode : null;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  constructor() {
    // Each state renders its own h1. When route focus sits on the old one, hand it to the new one (WCAG 2.4.3).
    effect(() => {
      this.store.state();
      const heading = this.host.querySelector('h1');
      if (heading && heading.ownerDocument.activeElement === heading) {
        afterNextRender(() => this.focusHeading(), { injector: this.injector });
      }
    });
  }

  ngOnInit(): void {
    this.store.enter();
  }

  private focusHeading(): void {
    const heading = this.host.querySelector<HTMLElement>('h1');
    if (heading && heading.ownerDocument.activeElement !== heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}
