import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { CompanionExpression } from '../../../core/companion/companion-copy';
import { AtlasCompanionAvatar, type CompanionAvatarSize } from './companion-avatar';

@Component({
  imports: [AtlasCompanionAvatar],
  template: `<atlas-companion-avatar [expression]="expression()" [size]="size()" [art]="art()" />`,
})
class Host {
  readonly expression = signal<CompanionExpression>('welcome');
  readonly size = signal<CompanionAvatarSize>('compact');
  readonly art = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const avatar = () => fixture.nativeElement.querySelector('atlas-companion-avatar') as HTMLElement;
  return { fixture, avatar };
}

describe('AtlasCompanionAvatar', () => {
  it('shows the decorative Atlas symbol while the art flag is off', async () => {
    const { avatar } = await render();

    expect(avatar().getAttribute('aria-hidden')).toBe('true');
    expect(avatar().classList).toContain('is-compact');
    expect(avatar().querySelector('atlas-logo')).not.toBeNull();
    expect(avatar().querySelector('img')).toBeNull();
  });

  it('shows the raster for the expression when the art flag is on', async () => {
    const { fixture, avatar } = await render();
    fixture.componentInstance.art.set(true);
    fixture.componentInstance.expression.set('celebrating');
    fixture.componentInstance.size.set('expanded');
    await fixture.whenStable();

    const image = avatar().querySelector('img')!;
    expect(image.getAttribute('src')).toBe('companion/celebrating.png');
    expect(image.getAttribute('alt')).toBe('');
    expect(avatar().classList).toContain('is-expanded');
    expect(avatar().dataset['expression']).toBe('celebrating');
    expect(avatar().querySelector('atlas-logo')).toBeNull();
  });
});
