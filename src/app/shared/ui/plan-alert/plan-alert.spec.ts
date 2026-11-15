import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AtlasPlanAlert } from './plan-alert';

@Component({
  imports: [AtlasPlanAlert],
  template: `<atlas-plan-alert message="Could not delete." (dismissed)="dismissed = true" />`,
})
class Host {
  dismissed = false;
}

describe('AtlasPlanAlert', () => {
  it('announces the message as an alert and can be dismissed', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Could not delete.');
    element.querySelector<HTMLButtonElement>('button[aria-label="Dismiss message"]')!.click();
    expect(fixture.componentInstance.dismissed).toBe(true);
  });
});
