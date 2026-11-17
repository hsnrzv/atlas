import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasCompanionCard } from './companion-card';

@Component({
  imports: [AtlasCompanionCard],
  template: `
    <atlas-companion-card
      trigger="next-step"
      [mode]="mode()"
      [body]="body()"
      [art]="art()"
      (dismissed)="events.push('dismissed')"
      (muted)="events.push('muted')"
      (disabled)="events.push('disabled')"
    >
      <a atlasCompanionAction href="/waypoints/n1">View waypoint</a>
    </atlas-companion-card>
  `,
})
class Host {
  readonly mode = signal<'on' | 'muted'>('on');
  readonly body = signal<string | null>(null);
  readonly art = signal(false);
  readonly events: string[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('AtlasCompanionCard', () => {
  it('shows the static copy as a named region with the projected action', async () => {
    const { root } = await render();
    const card = root.querySelector('atlas-companion-card')!;
    const title = card.querySelector('h2')!;

    expect(card.getAttribute('role')).toBe('region');
    expect(card.getAttribute('aria-labelledby')).toBe(title.id);
    expect(card.querySelector('.eyebrow')?.textContent).toContain('At your pace');
    expect(title.textContent).toContain('Choose one meaningful next step.');
    expect(card.querySelector('a')?.textContent).toContain('View waypoint');
    expect(card.querySelector('atlas-companion-avatar')?.getAttribute('aria-hidden')).toBe('true');
    expect(card.querySelector('atlas-companion-avatar')?.classList).toContain('is-compact');
    expect(card.querySelector('atlas-logo')).not.toBeNull();
  });

  it('shows the companion expression for the trigger when the art is on', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.art.set(true);
    await fixture.whenStable();

    expect(root.querySelector('atlas-companion-avatar img')?.getAttribute('src')).toBe(
      'companion/guiding.png',
    );
    expect(root.querySelector('atlas-logo')).toBeNull();
  });

  it('emits Dismiss, Mute and Disable', async () => {
    const { fixture, root } = await render();
    root.querySelector<HTMLButtonElement>('[aria-label="Dismiss companion"]')!.click();
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('.actions button')];
    buttons.forEach((button) => button.click());

    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Mute', 'Disable']);
    expect(fixture.componentInstance.events).toEqual(['dismissed', 'muted', 'disabled']);
  });

  it('drops the art slot and Mute when muted and shows an optional body', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.mode.set('muted');
    fixture.componentInstance.body.set('No points.');
    await fixture.whenStable();

    expect(root.querySelector('atlas-companion-card')?.classList).toContain('is-muted');
    expect(root.querySelector('atlas-logo')).toBeNull();
    expect(root.querySelector('.body')?.textContent).toContain('No points.');
    expect(
      [...root.querySelectorAll('.actions button')].map((button) => button.textContent?.trim()),
    ).toEqual(['Disable']);
  });
});
