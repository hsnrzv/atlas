import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MY_ATLAS } from '../../core/layout/navigation';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'atlas-not-found-page',
  imports: [AtlasFeedbackState, AtlasPageHeader, MatButton, RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {
  protected readonly home = MY_ATLAS;
}
