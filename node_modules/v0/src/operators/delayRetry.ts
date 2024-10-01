import { MonoTypeOperatorFunction, Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

export function delayRetry<T>({
  maxAttempts = 3,
  duration = 1000
}: {
  maxAttempts?: number;
  duration?: number;
} = {}): MonoTypeOperatorFunction<T> {
  return retryWhen<T>(
    (attempts: Observable<unknown>): Observable<unknown> =>
      attempts.pipe(
        mergeMap((error, i) => {
          const retryAttempt = i + 1;
          // 如果已经达到最大尝试次数
          if (retryAttempt > maxAttempts) {
            return throwError(error);
          }
          // 1s, 2s, ... 后重试
          return timer(retryAttempt * duration);
        })
      )
  );
}
