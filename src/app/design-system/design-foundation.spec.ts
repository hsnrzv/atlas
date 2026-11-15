import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LIFE_DIMENSIONS } from '../shared/design-system/life-dimensions';
import { ATLAS_STATUSES } from '../shared/design-system/statuses';
import { DesignFoundation } from './design-foundation';

describe('DesignFoundation', () => {
  it('renders every foundation section, Life Dimension and status', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DesignFoundation);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect([...root.querySelectorAll('h2[id]')].map((heading) => heading.textContent)).toEqual(
      expect.arrayContaining(['Colour', 'Typography', 'Life Dimensions', 'Status', 'Icons']),
    );
    for (const dimension of LIFE_DIMENSIONS) expect(text).toContain(dimension.label);
    for (const status of ATLAS_STATUSES) expect(text).toContain(status.label);
  });
});
