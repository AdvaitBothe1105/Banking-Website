/* eslint-disable max-classes-per-file */
import { Observable, of } from 'rxjs';
import { Cacheable, ResultType } from '../../src';

describe('@Cacheable', () => {
  test('@Cacheable Promise', async () => {
    class Demo {
      @Cacheable(1000, ResultType.Promise)
      // eslint-disable-next-line class-methods-use-this
      async save(n: number): Promise<string> {
        const result = await Promise.resolve(`${n} succeed`);
        return result;
      }
    }
    const demo = new Demo();
    const result1 = await demo.save(1);
    expect(result1).toEqual('1 succeed');
  });

  test('@Cacheable Observable', (complete) => {
    class Demo {
      @Cacheable()
      // eslint-disable-next-line class-methods-use-this
      save(n: number): Observable<string> {
        return of(`${n} succeed`);
      }
    }
    const demo = new Demo();
    const result1 = demo.save(1);
    result1.subscribe({
      next: (val) => {
        expect(val).toEqual('1 succeed');
      },
      complete
    });
  });
});
