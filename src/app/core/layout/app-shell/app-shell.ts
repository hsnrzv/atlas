import { DOCUMENT, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AtlasLayout } from '../atlas-layout';
import { AtlasBottomNav } from '../bottom-nav/bottom-nav';
import { AtlasSidebar } from '../sidebar/sidebar';
import { AtlasTopbar } from '../topbar/topbar';

/**
 * Responsive application frame (Figma page 04, F1-14): sidebar ≥ 1024 px, icon rail 768–1023 px, top bar and
 * bottom navigation below 768 px. Every routed page renders into `<main>` and owns its `h1`.
 */
@Component({
  selector: 'atlas-app-shell',
  imports: [AtlasBottomNav, AtlasSidebar, AtlasTopbar, RouterOutlet],
  template: `
    <a class="atlas-skip-link" href="#main" (click)="skipToMain($event)">Skip to main content</a>

    @if (mode() !== 'mobile') {
      <atlas-sidebar class="sidebar" [rail]="mode() === 'rail'" />
    }

    <div class="pane">
      <header class="topbar">
        <atlas-topbar [showBrand]="mode() !== 'sidebar'" />
      </header>
      <main class="main" id="main" tabindex="-1">
        <router-outlet />
      </main>
    </div>

    @if (mode() === 'mobile') {
      <nav class="bottom-nav" aria-label="Primary">
        <atlas-bottom-nav />
      </nav>
    }
  `,
  styleUrl: './app-shell.scss',
  host: { '[attr.data-layout]': 'mode()' },
})
export class AtlasAppShell {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = inject(AtlasLayout).mode;

  /** `href="#main"` would resolve against `<base href>` and reload the app, so focus the target directly. */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main')?.focus();
  }
}
