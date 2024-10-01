import 'reflect-metadata';
import { Observable, of, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { hash, toPromise } from './helpers';

export function cacheable<T extends (...args: any[]) => Observable<any> | Promise<any>>(
  func: T,
  timeout = 0,
  isPromise = false
): T {
  const cache: { [key: string]: Observable<any> | Promise<any> } = {};
  return function (this: any, ...args: any[]) {
    const key = hash(args);
    if (!cache[key]) {
      const rawResult = toPromise(func.bind(this), args);
      const result = from(rawResult).pipe(
        tap((value) => {
          cache[key] = isPromise ? Promise.resolve(value) : of(value);
          setTimeout(() => {
            delete cache[key];
          }, timeout);
        }),
        catchError((error) => {
          cache[key] = isPromise ? Promise.reject(error) : throwError(error);
          throw error;
        })
      );
      cache[key] = isPromise
        ? new Promise((resolve, reject) => {
            result.subscribe(
              (val) => {
                resolve(val);
              },
              (error) => {
                reject(error);
              }
            );
          })
        : result;
    }
    return cache[key];
  } as T;
}
