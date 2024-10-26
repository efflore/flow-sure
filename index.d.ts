type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok';
    value: T;
    map: <U>(fn: (value: T) => U) => Ok<U>;
    chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>;
    filter: (fn: (value: T) => boolean) => Maybe<T>;
    guard: <U extends T>(fn: (value: T) => value is U) => Maybe<U>;
    or: (_: any) => Ok<T>;
    catch: (_: any) => Ok<T>;
    match: <U, F extends Error>(cases: Cases<T, Error, U, F>) => Result<U, F>;
    get: () => T;
};
type Nil = {
    readonly [Symbol.toStringTag]: 'Nil';
    map: (_: any) => Nil;
    chain: (_: any) => Nil;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Maybe<T>;
    catch: (_: any) => Nil;
    match: <U, F extends Error>(cases: Cases<any, Error, U, F>) => Result<U, F>;
    get: () => undefined;
};
type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err';
    error: E;
    map: (_: any) => Err<E>;
    chain: (_: any) => Err<E>;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Maybe<T>;
    catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => Result<U, F>;
    match: <U, F extends Error>(cases: Cases<any, E, U, F>) => Result<U, F>;
    get: () => never;
};
type Maybe<T> = Ok<T> | Nil;
type Result<T, E extends Error> = Ok<T> | Nil | Err<E>;
type Cases<T, E extends Error, U, F extends Error> = {
    [TYPE_OK]?: (value: T) => Result<U, F>;
    [TYPE_NIL]?: () => Result<U, F>;
    [TYPE_ERR]?: (error: E) => Result<U, F>;
};
declare const TYPE_OK = "Ok";
declare const TYPE_NIL = "Nil";
declare const TYPE_ERR = "Err";
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
declare const isDefinedObject: (value: unknown) => value is Record<PropertyKey, unknown>;
declare const isObjectOfType: <T>(value: unknown, type: string) => value is T;
declare const isOk: <T>(value: unknown) => value is Ok<T>;
declare const isNil: (value: unknown) => value is Nil;
declare const isErr: <E extends Error>(value: unknown) => value is Err<E>;
declare const isMaybe: <T>(value: unknown) => value is Ok<T> | Nil;
declare const isResult: <T, E extends Error>(value: unknown) => value is Ok<T> & Nil & Err<E>;
declare const isFunction: (value: unknown) => value is Function;
declare const callFunction: (fn: unknown, ...args: unknown[]) => unknown;
/**
 * Create an "Ok" value, representing a value
 *
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T, E>} - "Ok" value with the given value
 */
declare const Ok: <T>(value: T) => Ok<T>;
/**
 * Create a "Nil" value, representing a lack of a value
 *
 * @since 0.9.0
 * @returns {Nil} - "Nil" value
 */
declare const Nil: () => Nil;
/**
 * Create a "Err" value, representing a failure
 *
 * @since 0.9.0
 * @param {E} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
declare const Err: <E extends Error>(error: E) => Err<E>;
/**
 * Create an option for a given value to gracefully handle nullable values
 *
 * @since 0.9.0
 * @param {T | Maybe<T> | null | undefined} value - value to wrap in an array
 * @returns {Maybe<T>} - option of either Ok or Nil, depending on whether the input is nullish
 */
declare const ensure: <T>(value: T | Maybe<T> | null | undefined) => Maybe<T>;
/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 *
 * @since 0.9.0
 * @param {() => T | Result<T>} fn - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
declare const attempt: <T, E extends Error>(fn: () => T | Maybe<T>) => Result<T, E>;
/**
 * Create an async task to obtain a resouce; retries the given function with exponential backoff if it fails
 *
 * @since 0.9.0
 * @param {() => Promise<T>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<T>} - promise that resolves to the result of the function or fails with the last error encountered
 */
declare const obtain: <T, E extends Error>(fn: () => Promise<T | Result<T, E>>, retries?: number, delay?: number) => Promise<Result<T, E>>;
/**
 * Helper function to execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {((v: T) => U)[]} fns
 * @returns
 */
declare function flow<T, E extends Error>(...fns: [T | (() => Result<T, E>), ...((input: Result<T, E>) => Result<any, any> | Promise<Result<any, any>>)[]]): Promise<Result<any, any>>;
export { type Result, type Cases, isDefined, isDefinedObject, isObjectOfType, isFunction, callFunction, isOk, isNil, isErr, isMaybe, isResult, Ok, Nil, Err, ensure, attempt, obtain, flow };
