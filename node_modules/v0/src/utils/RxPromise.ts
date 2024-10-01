import { Observable } from 'rxjs';

export class RxPromise<T, R = Error> extends Observable<T> {
  constructor(resolver: (resolve: (r: T) => void, reject: (r: R) => void) => void) {
    super((subscriber) => {
      try {
        resolver(
          (value: T) => {
            subscriber.next(value);
            subscriber.complete();
          },
          (reason: R) => {
            subscriber.error(reason);
          }
        );
      } catch (e) {
        subscriber.error(e);
      }
    });
  }
}
