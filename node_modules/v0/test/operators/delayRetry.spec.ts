import { range, throwError, of, from, Observable } from 'rxjs';
import { mergeMap, tap, map, catchError } from 'rxjs/operators';

import { delayRetry } from '../../src';

describe('delayRetry', () => {
  test('delayRetry total pipeline', (done) => {
    const result: number[] = [];

    const s$ = range(1, 5).pipe(
      tap((x) => {
        result.push(x);
      }),
      mergeMap((val) => {
        if (val > 3) {
          return throwError(val);
        }
        return of(val);
      }),
      delayRetry({
        maxAttempts: 2,
        duration: 200
      }),
      catchError((error) => of(error))
    );

    s$.subscribe({
      complete() {
        expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]));
        done();
      }
    });
  });

  test('delayRetry specific observable', (done) => {
    const result: number[] = [];

    const s$ = range(1, 5).pipe(
      map((val) => val + 3),
      tap((x) => {
        result.push(x);
      }),
      mergeMap((val) =>
        from(
          ((): Observable<unknown> => {
            if (val > 6) {
              return throwError(val);
            }
            return of(val);
          })()
        ).pipe(
          delayRetry(),
          catchError((error) => of(error))
        )
      )
    );

    s$.subscribe({
      complete() {
        expect(result).toEqual([4, 5, 6, 7, 8]);
        done();
      }
    });
  }, 60000);
});
