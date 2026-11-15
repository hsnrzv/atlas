import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { AtlasTitleStrategy } from './atlas-title-strategy';

describe('AtlasTitleStrategy', () => {
  it('names the record a detail page shows before the page and app names', () => {
    const strategy = TestBed.inject(AtlasTitleStrategy);
    strategy.pageTitle.set('Waypoint');

    strategy.describePage('Graduate');

    expect(TestBed.inject(Title).getTitle()).toBe('Graduate · Waypoint · IKIGAI ATLAS');
  });

  it('falls back to the detail and app names without a page title', () => {
    const strategy = TestBed.inject(AtlasTitleStrategy);

    strategy.describePage('Graduate');

    expect(TestBed.inject(Title).getTitle()).toBe('Graduate · IKIGAI ATLAS');
  });
});
