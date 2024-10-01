# v0

Useful Rxjs Operators & Utils.

[![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin) [![npm](https://img.shields.io/npm/v/v0.svg)](https://npmjs.org/package/v0) [![npm](https://img.shields.io/npm/dm/v0.svg)](https://npmjs.org/package/v0) [![npm](https://img.shields.io/npm/dt/v0.svg)](https://npmjs.org/package/v0) [![Maintainability](https://api.codeclimate.com/v1/badges/e7da4dfd45eeaa59402a/maintainability)](https://codeclimate.com/github/willin/v0/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/e7da4dfd45eeaa59402a/test_coverage)](https://codeclimate.com/github/willin/v0/test_coverage)

> 你的`关注`是我最大的动力。 Your `Star` is the best gift.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
  - [Operators](#operators)
    - [delayRetry](#delayretry)
    - [tapAsync](#tapasync)
  - [Decorators](#decorators)
    - [@Cacheable(timeout = 0, mode = ReturnType.Detect)](#cacheabletimeout--0-mode--returntypedetect)
  - [Utils](#utils)
    - [cacheable(FN, timeout = 0, isPromise = false)](#cacheablefn-timeout--0-ispromise--false)
    - [RxPromise](#rxpromise)
- [Contribute](#contribute)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm i --save rxjs v0
# or
yarn add rxjs v0
```

# Usage

中文文档参考： [rx.js.cool](https://rx.js.cool/) 中的【[进阶（Advanced）](http://rx.js.cool/v0)】章节系列文章

## Operators

### delayRetry

```ts
{
  maxAttempts?: number;
  duration?: number;
}
```

Defaults:

```
{
  maxAttempts = 3,
  duration = 1000
}
```

Usage:

```ts
import { delayRetry } from 'v0';
// import { delayRetry } from 'v0/operators';

source$.pipe(
  // ...
  // Retry all options in current pipe
  delayRetry({
    maxAttempts: 2,
    duration: 200
  }),
  // catchError is needed
  catchError((error) => of(error))
);
```

### tapAsync

Just like tap, support async/await (promise) function.

Usage:

```ts
import { tapAsync } from 'v0';
// import { tapAsync } from 'v0/operators';

source$.pipe(
  tapAsync(async (val) => {
    await SomeFn(val);
  })
);
```

## Decorators

### @Cacheable(timeout = 0, mode = ReturnType.Detect)

Return Type:

```ts
enum ResultType {
  Promise = 'Promise',
  Observable = 'Observable',
  Detect = 'Detect'
}
```

Usage:

```ts
import { interval } from 'rxjs';
import { Cacheable, ReturnType } from 'v0';
// import { Cacheable } from 'v0/decorators';

class Demo {
  @Cacheable(300, ReturnType.Promise)
  async save(n: number) {
    // await something...
    console.log(`${n} saved`);
    return `${n} succeed`;
  }
}

const demo = new Demo();

demo.save(1).then(console.log);
demo.save(1).then(console.log);
demo.save(3).then(console.log);

/** logs:
 *  1 saved         <---- save only called once, the second call resued before if last call is pending
 *  1 succeed
 *  1 succeed
 *  3 saved
 *  3 succeed
 */
```

## Utils

### cacheable(FN, timeout = 0, isPromise = false)

```ts
import { cacheable } from 'v0';
// import { cacheable } from 'v0/utils';

const get = () => {
  return from(
    new Promise((resolve) => {
      setTimeout(() => resolve(new Date()), 2000);
    })
  );
};

const cachedGet = cacheable(get, false /*if this function returns a PromiseLike result*/);
```

### RxPromise

```ts
import { RxPromise } from 'v0';
// import { RxPromise } from 'v0/utils';

// RxPromise<T, R = Error> extends Observable<T>
const mockedPromise = new RxPromise(resolver);
```

Type of `resolver`:

```ts
(resolve: (r: T) => void, reject: (r: R) => void) => void
```

Example，transform mongoose `exec` to observable:

```ts
import mongoose from 'mongoose';
import { RxPromise } from 'v0';

mongoose.Promise = RxPromise;

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
const kittySchema = new mongoose.Schema({
  name: String
});
const Kitten = mongoose.model('Kitten', kittySchema);

const s$ = <Observable<Record<string, unknown>[]>>(<any>Kitten.find().exec());
// or
// const s$ = (Kitten.find().exec()) as any) as Observable<Record<string, unknown>[]>;

s$.subscribe({
  next(v) {
    console.log(v);
  },
  complete() {
    console.log('ended');
  }
});
```

# Contribute

1. Add your own operator
2. Update Readme Doc (List / Usage)
3. Make a PR

# License

Apache 2.0

通过支付宝捐赠：

![qr](https://cloud.githubusercontent.com/assets/1890238/15489630/fccbb9cc-2193-11e6-9fed-b93c59d6ef37.png)
