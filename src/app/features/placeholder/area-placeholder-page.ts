import { Component, input } from '@angular/core';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';

/**
 * Stand-in for an area whose page has not been built yet (F1-14). Each area replaces it with its own lazy route;
 * the title and description come from the route data.
 */
@Component({
  selector: 'atlas-area-placeholder-page',
  imports: [AtlasFeedbackState, AtlasPageHeader],
  template: `
    <atlas-page-header [title]="heading()" [description]="description()" />
    <atlas-feedback-state
      title="This area is on its way"
      description="It arrives in a later step of the build. Use the navigation to explore the rest of your Atlas."
    />
  `,
})
export class AreaPlaceholderPage {
  /** Route data, bound by `withComponentInputBinding()`. */
  readonly heading = input.required<string>();
  readonly description = input<string>();
}
