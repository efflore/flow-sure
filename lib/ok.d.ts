import { type Cases } from './util';
import type { Maybe } from './maybe';
import { type MaybeResult, type Result } from './result';
/**
 * Create an "Ok" value, representing a value
 *
 * @since 0.9.0
 * @class Ok<T>
 * @property {NonNullable<T>} value - the value
 */
declare class Ok<T> {
    private value;
    private mut;
    constructor(value: T);
    /**
     * Check if the Ok value has been consumed
     */
    get gone(): boolean;
    /**
     * Apply a function to the Ok value and return a new Ok instance
     *
     * @since 0.9.0
     * @param {(value: T) => NonNullable<U>} fn - the function to apply
     * @returns {Ok<U>} - a new Ok instance with the result of the function applied to the value
     */
    map<U extends {}>(fn: (value: T) => NonNullable<U>): Ok<U>;
    /**
     * Apply a function to the Ok value and return its resulting Result instance
     *
     * @since 0.9.0
     * @param {(value: T) => MaybeResult<U>} fn - the function to apply
     * @returns {Result<U>} - the new Result instance of the function applied to the value
     */
    chain<U>(fn: (value: T) => MaybeResult<U>): Result<U>;
    /**
     * Apply an asynchronous function to the Ok value and return its resulting Result instance
     *
     * @since 0.9.0
     * @param {(value: T) => Promise<MaybeResult<U>>} fn - the async function to apply
     * @returns {Promise<Result<U>>} - the new Result instance wrapped in a Promise
     */
    await<U>(fn: (value: T) => Promise<MaybeResult<U>>): Promise<Result<U>>;
    /**
     * Filter the Ok value based on a predicate function
     *
     * @since 0.9.0
     * @param {function} fn - the predicate function
     * @returns {Maybe<T>} - the Ok instance with filtered value if the predicate function returns true, otherwise nil()
     */
    filter(fn: (value: T) => boolean): Maybe<T>;
    guard<U extends T>(fn: (value: T) => value is U): Maybe<T>;
    /**
     * No-op methods for Ok
     */
    or(_: any): Ok<T>;
    catch(_: any): Ok<T>;
    /**
     * Match the Ok value with a set of cases
     *
     * @since 0.9.0
     * @param {Cases<T>} cases - a set of cases to match against
     * @returns {any} - the result of the Ok function in cases or the original Ok instance
     */
    match(cases: Cases<T, Error>): any;
    /**
     * Unwrap the Ok value
     *
     * @since 0.9.0
     * @returns {T | never} - the value or throws an error if the value has already been consumed
     */
    get(): T | never;
}
/**
 * Create an Ok value
 *
 * @since 0.9.6
 * @param {NonNullable<T>} value - the value
 * @returns {Ok<T>} - the Ok instance
 */
declare const ok: <T>(value: T) => Ok<T>;
/**
 * Check if a value is an instance of Ok
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is an instance of Ok
 */
declare const isOk: (value: unknown) => value is Ok<any>;
/**
 * Check if the Ok value has been consumed
 *
 * @since 0.10.0
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the Ok value has been consumed
 */
declare const isGone: (value: unknown) => boolean;
export { Ok, ok, isOk, isGone };
