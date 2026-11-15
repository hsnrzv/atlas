import { Component, input, output } from '@angular/core';
import { AtlasIcon } from '../../icons/atlas-icon';
import { AtlasIconButton } from '../icon-button/icon-button';

/**
 * A failed write on a plan page (delete, move, archive), announced as an alert and kept on screen until dismissed,
 * so the toast is never the only record of an error.
 */
@Component({
  selector: 'atlas-plan-alert',
  imports: [AtlasIcon, AtlasIconButton],
  templateUrl: './plan-alert.html',
  styleUrl: './plan-alert.scss',
})
export class AtlasPlanAlert {
  readonly message = input.required<string>();
  readonly dismissed = output();
}
