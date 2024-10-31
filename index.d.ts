declare const Maybe: {
    of: <T>(value: T) => import("./lib/maybe").Maybe<T>;
    isMaybe: (value: unknown) => value is import("./lib/maybe").Maybe<unknown>;
};
declare const Result: {
    of: <T>(value: import("./lib/result").MaybeResult<T>) => import("./lib/result").Result<T>;
    from: <T>(fn: () => import("./lib/result").MaybeResult<T>) => import("./lib/result").Result<T>;
    fromAsync: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<import("./lib/result").Result<T>>;
    isResult: (value: unknown) => value is import("./lib/result").Result<unknown>;
    unwrap: <T>(value: import("./lib/result").Result<T> | T | undefined) => T | Error | undefined;
};
export { Ok } from './lib/ok';
export { Nil } from './lib/nil';
export { Err } from './lib/err';
export { Maybe, Result };
export { flow } from './lib/flow';
