import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { tapAsync } from '../../src';

test('tapAsync', (done) => {
  const result: number[] = [];

  const s$ = of(1, 2, 3).pipe(
    tapAsync(async (x) => {
      await Promise.resolve(x);
      result.push(x);
    }),
    map((x) => x ** 2),
    tap((x) => {
      result.push(x);
    })
  );

  s$.subscribe({
    complete() {
      expect(result).toEqual(expect.arrayContaining([1, 2, 3, 1, 4, 9]));
      done();
    }
  });
});
