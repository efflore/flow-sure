/**
 * @name FlowSure
 * @version 0.9.5
 * @author Esther Brunner
 */
interface Ok<T> {
    readonly [Symbol.toStringTag]: 'Ok';
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>;
    chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>;
    filter: (fn: (value: T) => boolean) => Maybe<T>;
    guard: <U extends T>(fn: (value: T) => value is U) => Maybe<U>;
    or: (_: any) => Ok<T>;
    catch: (_: any) => Ok<T>;
    match: (cases: Cases<T, Error>) => any;
}
interface Nil {
    readonly [Symbol.toStringTag]: 'Nil';
    map: (_: any) => Nil;
    chain: (_: any) => Nil;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Maybe<T>;
    catch: (_: any) => Nil;
    match: (cases: Cases<undefined, Error>) => any;
}
interface Err<E extends Error> {
    readonly [Symbol.toStringTag]: 'Err';
    map: (_: any) => Err<E>;
    chain: (_: any) => Err<E>;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Maybe<T>;
    catch: <T, F extends Error>(fn: (error: E) => Result<T, F>) => Result<T, F>;
    match: (cases: Cases<undefined, E>) => any;
}
type Maybe<T> = Ok<T> | Nil;
type Result<T, E extends Error> = Ok<T> | Nil | Err<E>;
type MaybeResult<T, E extends Error> = T | Result<T, E> | undefined;
type AsyncResult<T, E extends Error> = MaybeResult<T, E> | Promise<MaybeResult<T, E>> | PromiseLike<MaybeResult<T, E>>;
type Cases<T, E extends Error> = {
    Ok?: (value: T) => any;
    Nil?: () => any;
    Err?: (error: E) => any;
};
declare const isFunction: (value: unknown) => value is Function;
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
declare const isOk: <T>(value: unknown) => value is Ok<T>;
declare const isNil: (value: unknown) => value is Nil;
declare const isErr: <E extends Error>(value: unknown) => value is Err<E>;
declare const isMaybe: <T>(value: unknown) => value is Maybe<T>;
declare const isResult: <T, E extends Error>(value: unknown) => value is Result<T, E>;
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
declare const attempt: <T, E extends Error>(fn: () => T | Result<T, E>) => Result<T, E>;
/**
 * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
 *
 * @since 0.9.0
 * @param {() => AsyncResult<T, E>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<Result<T, E>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
declare const gather: <T, E extends Error>(fn: () => AsyncResult<T, E>, retries?: number, delay?: number) => Promise<Result<T, E>>;
/**
 * Helper function to execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T, E>), ...((input: T) => AsyncResult<T, E>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
declare function flow<T, E extends Error>(...fns: [T | (() => AsyncResult<T, E>), ...((input: T) => AsyncResult<T, E>)[]]): Promise<Result<any, E>>;
/**
 * Create an "Ok" value, representing a value
 *
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T, E>} - "Ok" value with the given value
 */
declare class Ok<T> {
    readonly value: NonNullable<T>;
    static of: (value: NonNullable<any>) => Ok<any>;
    constructor(value: NonNullable<T>);
    get(): NonNullable<T>;
}
/**
 * Create a "Nil" value, representing a lack of a value
 *
 * @since 0.9.0
 * @returns {Nil} - "Nil" value
 */
declare class Nil {
    static of: () => Nil;
    get(): undefined;
}
/**
 * Create a "Err" value, representing a failure
 *
 * @since 0.9.0
 * @param {E} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
declare class Err<E extends Error> {
    readonly error: E;
    static of: (error: any) => Err<Error>;
    constructor(error: E);
    get(): void;
}
export { type Maybe, type Result, type MaybeResult, type AsyncResult, type Cases, isDefined, isFunction, isOk, isNil, isErr, isMaybe, isResult, Ok, Nil, Err, ensure, attempt, gather, flow };
