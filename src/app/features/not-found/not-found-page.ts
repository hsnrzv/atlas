import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MY_ATLAS } from '../../core/layout/navigation';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'atlas-not-found-page',
  imports: [AtlasFeedbackState, AtlasPageHeader, MatButton, RouterLink],
  template: `
    <atlas-page-header title="Page not found" />
    <atlas-feedback-state
      iconName="alert"
      title="We could not find this page"
      description="The link may be out of date, or the page may have moved."
    >
      <a mat-flat-button [routerLink]="home.path">Go to {{ home.label }}</a>
    </atlas-feedback-state>
  `,
})
export class NotFoundPage {
  protected readonly home = MY_ATLAS;
}
