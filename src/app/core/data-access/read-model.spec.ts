import { ApplicationRef, Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError, type Observable } from 'rxjs';
import { readModel } from './read-model';

const settle = () => TestBed.inject(ApplicationRef).whenStable();
const create = <T, P>(stream: (params: P) => Observable<T>, params?: () => P) =>
  runInInjectionContext(TestBed.inject(Injector), () => readModel(stream, params));

describe('readModel', () => {
  it('loads, keeps the last value through a failed refresh and retries', async () => {
    const responses: Observable<number>[] = [of(1), throwError(() => new Error('offline')), of(2)];
    const model = create(() => responses.shift()!);
    expect(model.state()).toBe('loading');
    await settle();
    expect(model.state()).toBe('ready');
    expect(model.value()).toBe(1);

    model.enter();
    model.enter();
    await settle();
    expect(model.state()).toBe('error');
    expect(model.value()).toBe(1);

    model.retry();
    await settle();
    expect(model.state()).toBe('ready');
    expect(model.value()).toBe(2);
  });

  it('reads again when the parameters change', async () => {
    const range = signal('3m');
    const seen: string[] = [];
    const model = create((value: string) => {
      seen.push(value);
      return of(value);
    }, range);
    await settle();
    range.set('1y');
    await settle();
    expect(seen).toEqual(['3m', '1y']);
    expect(model.value()).toBe('1y');
  });
});
