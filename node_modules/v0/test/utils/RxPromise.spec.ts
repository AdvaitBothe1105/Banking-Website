import { RxPromise } from '../../src';

describe('RxPromise', () => {
  test('RxPromise Resolve', (complete) => {
    const s$ = new RxPromise((resolve) => {
      resolve(1);
    });

    s$.subscribe({
      next(value) {
        expect(value).toEqual(1);
      },
      complete
    });
  });

  test('RxPromise Reject', (complete) => {
    const s$ = new RxPromise((resolve, reject) => {
      reject(new Error('test'));
    });

    s$.subscribe({
      error(err: Error) {
        expect(err.message).toEqual('test');
        complete();
      },
      complete
    });
  });

  test('RxPromise Reject', (complete) => {
    const s$ = new RxPromise(() => {
      throw new Error('test');
    });

    s$.subscribe({
      error(err: Error) {
        expect(err.message).toEqual('test');
        complete();
      },
      complete
    });
  });
});
