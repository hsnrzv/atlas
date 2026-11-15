import { Component, inject, input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AtlasLogo } from '../../../shared/brand/atlas-logo';
import { AtlasIcon } from '../../../shared/icons/atlas-icon';
import { AtlasIconButton } from '../../../shared/ui/icon-button/icon-button';
import { AtlasTheme, AtlasThemePreference } from '../../theme/atlas-theme';
import { AtlasTitleStrategy } from '../atlas-title-strategy';
import { ACCOUNT_NAV, MY_ATLAS } from '../navigation';

const THEME_OPTIONS: readonly { readonly value: AtlasThemePreference; readonly label: string }[] = [
  { value: 'system', label: 'Match device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * Application top bar (Figma Atlas/V3/TopBar 152:5155). Shows the page name (the page itself owns the `h1`)
 * and the account menu, which also holds the appearance choice (PLAN-FRONTEND D1). Search, quick add and
 * notifications are not rendered until they have behaviour (roadmap R-14).
 */
@Component({
  selector: 'atlas-topbar',
  imports: [
    AtlasIcon,
    AtlasIconButton,
    AtlasLogo,
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
  ],
  template: `
    @if (showBrand()) {
      <a class="brand" [routerLink]="home.path" aria-label="IKIGAI ATLAS, go to My Atlas">
        <atlas-logo variant="symbol" [size]="32" [decorative]="true" />
      </a>
    }
    <p class="title">{{ title() }}</p>

    <button
      atlas-icon-button
      icon="profile"
      aria-label="Account and appearance"
      size="compact"
      appearance="ghost"
      [matMenuTriggerFor]="account"
    ></button>

    <mat-menu #account="matMenu" xPosition="before" class="atlas-account-menu">
      @for (link of accountLinks; track link.path) {
        <a mat-menu-item [routerLink]="link.path">
          <atlas-icon [name]="link.icon" size="md" />
          <span>{{ link.label }}</span>
        </a>
      }
      <mat-divider />
      <div role="group" aria-label="Appearance">
        <p class="menu-heading" aria-hidden="true">Appearance</p>
        @for (option of themeOptions; track option.value) {
          <button
            mat-menu-item
            role="menuitemradio"
            [attr.aria-checked]="theme.preference() === option.value"
            (click)="theme.setPreference(option.value)"
          >
            <atlas-icon
              [name]="'check'"
              size="md"
              [class.is-hidden]="theme.preference() !== option.value"
            />
            <span>{{ option.label }}</span>
          </button>
        }
      </div>
    </mat-menu>
  `,
  styleUrl: './topbar.scss',
})
export class AtlasTopbar {
  /** Symbol beside the title on tablet and mobile, where there is no sidebar brand. */
  readonly showBrand = input(false);

  protected readonly theme = inject(AtlasTheme);
  protected readonly title = inject(AtlasTitleStrategy).pageTitle;
  protected readonly home = MY_ATLAS;
  protected readonly accountLinks = ACCOUNT_NAV;
  protected readonly themeOptions = THEME_OPTIONS;
}
