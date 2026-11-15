import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasDestinationPicker, type DestinationOption } from './destination-picker';

@Component({
  imports: [AtlasDestinationPicker],
  template: `<atlas-destination-picker
    [options]="options()"
    value="a"
    (valueChange)="chosen = $event"
  />`,
})
class Host {
  readonly options = signal<DestinationOption[]>([{ id: 'a', title: 'Master’s degree' }]);
  chosen = '';
}

describe('AtlasDestinationPicker', () => {
  it('hides itself when there is only one Destination', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-select')).toBeNull();
  });

  it('offers every Destination and emits the choice', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.options.set([
      { id: 'a', title: 'Master’s degree' },
      { id: 'b', title: 'Run a marathon' },
    ]);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('mat-select') as HTMLElement;
    expect(select.textContent).toContain('Master’s degree');
    select.click();
    await fixture.whenStable();
    const options = document.querySelectorAll<HTMLElement>('mat-option');
    expect([...options].map((option) => option.textContent?.trim())).toEqual([
      'Master’s degree',
      'Run a marathon',
    ]);
    options[1].click();
    expect(fixture.componentInstance.chosen).toBe('b');
  });
});
