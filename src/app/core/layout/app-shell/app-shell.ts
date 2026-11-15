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
  templateUrl: './app-shell.html',
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
