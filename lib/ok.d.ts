import { type Cases } from './util';
import { Nil } from './nil';
import type { Result } from './result';
interface Ok<T> {
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>;
    chain: <U>(fn: (value: T) => Result<U>) => Result<U>;
    filter: (fn: (value: T) => boolean) => Ok<T> | Nil;
    guard: <U extends T>(fn: (value: T) => value is U) => Ok<U> | Nil;
    or: (_: any) => Ok<T>;
    catch: (_: any) => Ok<T>;
    match: (cases: Cases<T, Error>) => any;
}
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
    readonly value: T;
    constructor(value: T);
    /**
     * Unwrap the Ok value
     *
     * @since 0.9.0
     * @returns {T} - the value
     */
    get(): T;
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
 * Check if the Ok value is an instance of Ok
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is an instance of Ok
 */
declare const isOk: (value: unknown) => value is Ok<any>;
export { Ok, ok, isOk };
