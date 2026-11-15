import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { lifeDimensionMeta, LIFE_DIMENSION_KEYS } from '../design-system/tokens.generated';
import { AtlasIcon } from './atlas-icon';
import { ATLAS_ICONS } from './atlas-icons';

@Component({
  imports: [AtlasIcon],
  template: `<atlas-icon name="destinations" [size]="size()" [label]="label()" />`,
})
class Host {
  readonly size = signal<'xs' | 'lg'>('lg');
  readonly label = signal<string | undefined>(undefined);
}

describe('AtlasIcon', () => {
  async function render(label?: string) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.label.set(label);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('atlas-icon')!;
    return { fixture, host, svg: host.querySelector('svg')! };
  }

  it('is hidden from assistive technology when decorative', async () => {
    const { host } = await render();
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.hasAttribute('role')).toBe(false);
    expect(host.hasAttribute('aria-label')).toBe(false);
  });

  it('exposes an accessible name when labelled', async () => {
    const { host } = await render('Destinations');
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Destinations');
    expect(host.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders the token icon size and stroke', async () => {
    const { fixture, svg } = await render();
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('stroke-width')).toBe('2');

    fixture.componentInstance.size.set('xs');
    await fixture.whenStable();
    expect(svg.getAttribute('width')).toBe('16');
  });
});

describe('ATLAS_ICONS', () => {
  it('uses the Life Dimension glyphs declared in design/tokens/design-tokens.json', () => {
    for (const key of LIFE_DIMENSION_KEYS) {
      expect(ATLAS_ICONS[key].name).toBe(lifeDimensionMeta[key].icon);
    }
  });

  it('uses outline icons only', () => {
    for (const icon of Object.values(ATLAS_ICONS)) {
      expect(icon.type).toBe('outline');
    }
  });
});
