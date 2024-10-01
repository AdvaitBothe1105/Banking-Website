import { OperatorFunction } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * tapAsync
 * @param fn Async Function
 *
 * const s$ = of(1, 2, 3, 4, 5, 6).pipe(
 * tapAsync(async x => {
 *   await Promise.resolve(x);
 *   console.log(x);
 * }),
 * map(x => x ** 2),
 * tap(x => console.log("calced", x))
 * );
 */
export function tapAsync<T>(fn: (x: T) => Promise<void | void | never>): OperatorFunction<T, T> {
  return mergeMap(async (x: T) => {
    await fn(x);
    return x;
  });
}
