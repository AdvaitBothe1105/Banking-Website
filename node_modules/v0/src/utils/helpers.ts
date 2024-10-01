import { Observable, from } from 'rxjs';
import crypto from 'crypto';

export function hash(target: any): string {
  return crypto.createHash('md5').update(JSON.stringify(target)).digest('hex');
}

// eslint-disable-next-line
export const AsyncFunction = async function () {}.constructor;

export function isAsyncOrPromise(fn: any): boolean {
  return fn instanceof Promise || fn instanceof AsyncFunction;
}

export async function toPromise<T>(fn: (...arg: any[]) => Observable<T> | Promise<T>, args: any[]): Promise<T> {
  // eslint-disable-next-line no-return-await
  return await new Promise((resolve, reject) => {
    from(fn(...args)).subscribe(
      (val) => resolve(val),
      (error) => reject(error)
    );
  });
}
