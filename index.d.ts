type Nil = {
    readonly [Symbol.toStringTag]: 'Nil';
    map: (_: (_: undefined) => unknown) => Nil;
    flatMap: (_: (_: undefined) => Result<unknown, Error>) => Nil;
    filter: (_: (_: undefined) => false) => Nil;
    guard: (_: (_: undefined) => false) => Nil;
    or: <T>(value: T) => Option<T>;
    catch: (_: (_: Error) => Result<unknown, Error>) => Nil;
    match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>;
    get: () => void;
};
type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok';
    value: T;
    map: <U, E extends Error>(fn: (value: T) => U) => Result<U, E>;
    flatMap: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>;
    filter: (fn: (value: T) => boolean) => Option<T>;
    guard: <U extends T>(fn: (value: T) => value is U) => Option<U>;
    or: (_: unknown) => Ok<T>;
    catch: (_: (_: Error) => Result<unknown, Error>) => Ok<T>;
    match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>;
    get: () => T;
};
type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err';
    error: E;
    map: (_: (_: undefined) => unknown) => Err<E>;
    flatMap: (_: (_: undefined) => Result<unknown, Error>) => Err<E>;
    filter: (_: (_: undefined) => false) => Err<E>;
    guard: (_: (_: undefined) => false) => Err<E>;
    or: <T>(value: T) => Option<T>;
    catch: <T, F extends Error>(fn: (error: E) => Result<T, F>) => Result<T, F>;
    match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>;
    get: () => never;
};
type Option<T> = Ok<T> | Nil;
type Result<T, E extends Error> = Ok<T> | Nil | Err<E>;
type Cases<T, E extends Error> = {
    [TYPE_OK]?: (value: unknown) => Result<T, E>;
    [TYPE_NIL]?: () => Result<T, E>;
    [TYPE_ERR]?: (error: Error) => Result<T, E>;
    else?: (value: unknown) => Result<T, E>;
};
declare const TYPE_OK = "Ok";
declare const TYPE_NIL = "Nil";
declare const TYPE_ERR = "Err";
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
declare const isObjectOfType: <T>(type: string) => (value: unknown) => value is {} & {
    [Symbol.toStringTag]: T;
};
declare const isOk: (value: unknown) => value is {} & {
    [Symbol.toStringTag]: unknown;
};
declare const isNil: (value: unknown) => value is {} & {
    [Symbol.toStringTag]: unknown;
};
declare const isErr: (value: unknown) => value is {} & {
    [Symbol.toStringTag]: unknown;
};
declare const isResult: <T, E extends Error>(value: unknown) => value is Ok<T> | Err<E> | Nil;
declare const isFunction: (value: unknown) => value is Function;
declare const callFunction: (fn: unknown, ...args: unknown[]) => unknown;
/**
 * Create an "Ok" value, representing a value
 *
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T>} - "Ok" value with the given value
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
 * @param {E extends Error} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
declare const Err: <E extends Error>(error: E) => Err<E>;
/**
 * Create an array for a given value to gracefully handle nullable values
 *
 * @since 0.9.0
 * @param {T | null | undefined} value - value to wrap in an array
 * @returns {T[]} - array of either zero or one element, depending on whether the input is nullish
 */
declare const option: <T>(value: T | null | undefined) => Option<T>;
/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 *
 * @since 0.9.0
 * @param {() => T} f - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
declare const result: <T, E extends Error>(f: () => T) => Result<T, E>;
/**
 * Create an async task that retries the given function with exponential backoff if it fails
 *
 * @since 0.9.0
 * @param {() => Promise<T>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<T>} - promise that resolves to the result of the function or fails with the last error encountered
 */
declare const task: <T, E extends Error>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<Result<T, E>>;
/**
 * Helper function to execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {((v: unknown) => unknown)[]} fs
 * @returns
 */
declare const flow: (...fs: unknown[]) => unknown;
export { TYPE_OK, TYPE_NIL, TYPE_ERR, isDefined, isObjectOfType, isOk, isNil, isErr, isResult, isFunction, callFunction, Ok, Nil, Err, option, result, task, flow };
