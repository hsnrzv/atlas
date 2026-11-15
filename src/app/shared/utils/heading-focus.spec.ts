import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { keepHeadingFocus } from './heading-focus';

@Component({
  template: `@if (state() === 'a') {
      <h1 tabindex="-1">A</h1>
    } @else {
      <h1>B</h1>
    }`,
})
class Host {
  readonly state = signal<'a' | 'b'>('a');
  constructor() {
    keepHeadingFocus(this.state);
  }
}

describe('keepHeadingFocus', () => {
  it('moves focus to the new heading when the old one had it', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector('h1') as HTMLElement;
    first.focus();
    fixture.componentInstance.state.set('b');
    fixture.detectChanges();
    await fixture.whenStable();
    const next = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(next.textContent).toBe('B');
    expect(document.activeElement).toBe(next);
    fixture.nativeElement.remove();
  });
});
