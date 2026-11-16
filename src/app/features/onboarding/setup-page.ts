import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatChipListbox, MatChipOption, type MatChipListboxChange } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import type { IkigaiAreaKey } from '../../core/models/life-dimension';
import { LIFE_DIMENSIONS } from '../../shared/design-system/life-dimensions';
import { AtlasLogo } from '../../shared/brand/atlas-logo';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { OnboardingFlow } from './data-access/onboarding-flow';

/**
 * Optional setup (F3-4, Figma page 14 `230:63378`): focus Life Dimensions, a deferred intention and the companion
 * preferences. Nothing is required; no financial or health details are asked for.
 */
@Component({
  selector: 'atlas-setup-page',
  imports: [
    AtlasIcon,
    AtlasLogo,
    AtlasPlanAlert,
    MatButton,
    MatChipListbox,
    MatChipOption,
    RouterLink,
  ],
  templateUrl: './setup-page.html',
  styleUrl: './setup-page.scss',
})
export class SetupPage {
  protected readonly flow = inject(OnboardingFlow);
  protected readonly dimensions = LIFE_DIMENSIONS;
  protected readonly selected = signal<readonly IkigaiAreaKey[]>([]);

  protected select(change: MatChipListboxChange): void {
    this.selected.set(change.value as IkigaiAreaKey[]);
  }

  protected continue(): Promise<void> {
    const areaKeys = this.selected();
    return this.flow.finish(areaKeys.length ? { areaKeys } : null);
  }
}
