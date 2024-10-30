/**
 * @name FlowSure
 * @version 0.9.6
 * @author Esther Brunner
 */
type Maybe<T> = Ok<T> | Nil;
type Result<T> = Ok<T> | Nil | Err<Error>;
type MaybeResult<T> = T | Result<T> | undefined;
type AsyncResult<T> = Promise<MaybeResult<T>>;
type Cases<T, E extends Error> = {
    Ok?: (value: T) => any;
    Nil?: () => any;
    Err?: (error: E) => any;
};
interface Ok<T> {
    readonly [Symbol.toStringTag]: 'Ok';
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>;
    chain: <U>(fn: (value: T) => Result<U>) => Result<U>;
    filter: (fn: (value: T) => boolean) => Ok<T> | Nil;
    guard: <U extends T>(fn: (value: T) => value is U) => Ok<U> | Nil;
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
    or: <T>(fn: () => T) => Ok<T> | Nil;
    catch: (_: any) => Nil;
    match: (cases: Cases<undefined, Error>) => any;
}
interface Err<E extends Error> {
    readonly [Symbol.toStringTag]: 'Err';
    map: (_: any) => Err<E>;
    chain: (_: any) => Err<E>;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Ok<T> | Nil;
    catch: <T>(fn: (error: E) => Result<T>) => Result<T>;
    match: (cases: Cases<undefined, E>) => any;
}
declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
declare const isAsyncFunction: (value: unknown) => value is (...args: any[]) => Promise<any> | PromiseLike<any>;
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
/**
 * Create an "Ok" value, representing a value
 *
 * @since 0.9.0
 * @class Ok<T>
 * @static of(value: T): Ok<T>
 * @property {NonNullable<T>} value - the value
 * @method get(): NonNullable<T>
 */
declare class Ok<T> {
    readonly value: NonNullable<T>;
    constructor(value: NonNullable<T>);
    /**
     * Create an Ok value
     *
     * @since 0.9.6
     * @param {NonNullable<T>} value - the value
     * @returns {Ok<unknown>} - the Ok instance
     */
    static of: <T_1>(value: NonNullable<T_1>) => Ok<T_1>;
    /**
     * Check if the Ok value is an instance of Ok
     *
     * @since 0.9.6
     * @param {unknown} value - the value to check
     * @returns {boolean} - true if the value is an instance of Ok
     */
    static isOk: (value: unknown) => value is Ok<any>;
    /**
     * Unwrap the Ok value
     *
     * @since 0.9.0
     * @returns {NonNullable<T>} - the value
     */
    get(): NonNullable<T>;
}
/**
 * "Nil" singleton, representing a lack of a value
 *
 * @since 0.9.0
 * @class Nil
 * @static of(): Nil
 * @method get(): undefined
 */
declare class Nil {
    private static instance;
    private constructor();
    /**
     * Get the singleton "Nil" instance
     *
     * @since 0.9.6
     * @returns {Nil}
     */
    static of: () => Nil;
    /**
     * Check if the given value is "Nil"
     *
     * @since 0.9.6
     * @param {unknown} value - the value to check
     * @returns {boolean} - whether the value is "Nil"
     */
    static isNil: (value: unknown) => value is Nil;
    /**
     * Unwrap the "Nil" value
     *
     * @since 0.9.0
     * @returns {undefined}
     */
    get(): undefined;
}
/**
 * Create a "Err" value, representing a failure
 *
 * @since 0.9.0
 * @class Err<E extends Error>
 * @property error - the error
 * @static of(error: any): Err<E>
 * @method get(): @throws E
 */
declare class Err<E extends Error> {
    readonly error: E;
    constructor(error: E);
    /**
     * Create a new "Err" value from an Error or any other value
     *
     * @since 0.9.6
     * @param {unknown} error - the error to create an "Err" value from
     * @returns {Err<Error>} - the new "Err" value
     */
    static of: (error: any) => Err<Error>;
    /**
     * Check if this is an "Err" value
     *
     * @since 0.9.6
     * @param {unknown} value - the value to check
     * @returns {boolean} - whether the value is an "Err" value
     */
    static isErr: (value: unknown) => value is Err<any>;
    /**
     * Re-throw the contained error
     *
     * @since 0.9.0
     * @throws E
     */
    get(): void;
}
declare namespace Maybe {
    /**
     * Wrap a value in a Maybe container if it is not already a Maybe type
     *
     * @since 0.9.6
     * @param {T} value - a value
     */
    const of: <T>(value: T) => Maybe<T>;
    /**
     * Check if a value is a Maybe type
     *
     * @since 0.9.6
     * @param {unknown} value - the value to check
     * @returns {boolean} - true if the value is a Maybe type, false otherwise
     */
    const isMaybe: (value: unknown) => value is Maybe<unknown>;
    /**
     * Unwrap a Maybe value or return the provided default value
     *
     * @since 0.9.6
     * @param {Maybe<T> | T | undefined} value - a Maybe value or a value
     * @returns {T | undefined} - the value or undefined
     */
    const unwrap: <T>(value: Maybe<T> | T | undefined) => T | undefined;
}
declare namespace Result {
    /**
     * Wrap a value in a Result container if it is not already a Result type
     *
     * @since 0.9.6
     * @param {MaybeResult<T>} value - a Result or value
     * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
     */
    const of: <T>(value: MaybeResult<T>) => Result<T>;
    /**
     * Create a Result from a function that may throw an error
     *
     * @since 0.9.6
     * @param {() => MaybeResult<T>} fn - a function that may throw an error
     * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
     */
    const from: <T>(fn: () => MaybeResult<T>) => Result<T>;
    /**
     * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
     *
     * @since 0.9.6
     * @param {() => AsyncResult<T>} fn - async function to try and maybe retry
     * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
     * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
     * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
     */
    const fromAsync: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<Result<T>>;
    /**
     * Check if a value is a Result type
     *
     * @since 0.9.6
     * @param {unknown} value - the value to check
     * @returns {boolean} - true if the value is a Result type, false otherwise
     */
    const isResult: (value: unknown) => value is Result<unknown>;
    /**
     * Unwrap a Result container, returning the value if it is Ok, or the error if it is Err
     *
     * @since 0.9.6
     * @param {MaybeResult<T>} value - a value or Result
     * @returns {T | Error | undefined} - the value or error from the Result
     */
    const unwrap: <T>(value: Result<T> | T | undefined) => T | Error | undefined;
}
/**
 * Helper function to execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
declare function flow<T>(...fns: [
    T | (() => MaybeResult<T> | AsyncResult<T>),
    ...((input: T) => MaybeResult<T> | AsyncResult<T>)[]
]): Promise<Result<any>>;
export { type MaybeResult, type AsyncResult, type Cases, isDefined, isFunction, isAsyncFunction, Ok, Nil, Err, Maybe, Result, flow };
