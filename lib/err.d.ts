import { type Cases } from "./util";
import { type Nil } from "./nil";
import { type Maybe } from "./maybe";
import { type MaybeResult, type Result } from "./result";
/**
 * Create a "Err" value, representing a failure
 *
 * @since 0.9.0
 * @class Err<E extends Error>
 * @property error - the error
 * @method get(): @throws E
 */
declare class Err<E extends Error> {
    readonly error: E;
    constructor(error: E);
    /**
     * No-op methods for Err
     */
    map(_: any): Err<E>;
    chain(_: any): Err<E>;
    await(_: any): Promise<Err<E>>;
    /**
     * Filter the error
     */
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    /**
     * Provide an alternative value
     *
     * @since 0.9.0
     * @param {() => T} fn - a function that returns an alternative value
     * @returns {Maybe<T>} - a new "Ok" containing the alternative value or "Nil"
     */
    or: <T>(fn: (error: E) => T) => Maybe<T>;
    /**
     * Catch an error and return a new "Maybe" containing the result of the passed through function
     *
     * @since 0.9.0
     * @param {function} fn - a function that takes the error and returns a new "Maybe"
     * @returns {Maybe<T>} - a new "Maybe" containing the result of the passed through function
     */
    catch: <T>(fn: (error: E) => MaybeResult<T>) => Result<T>;
    /**
     * Match Err with a set of cases
     *
     * @since 0.9.0
     * @param {Cases<undefined, E>} cases - a set of cases to match against
     * @returns {any} - the result of matching the cases or the passed through "Err"
     */
    match(cases: Cases<undefined, E>): any;
    /**
     * Re-throw the contained error
     *
     * @since 0.9.0
     * @throws E
     */
    get(): void;
}
/**
 * Create a new "Err" value from an Error or any other value
 *
 * @since 0.9.6
 * @param {unknown} error - the error to create an "Err" value from
 * @returns {Err<Error>} - the new "Err" value
 */
declare const err: (error: unknown) => Err<Error>;
/**
 * Check if this is an "Err" value
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - whether the value is an "Err" value
 */
declare const isErr: (value: unknown) => value is Err<any>;
export { Err, err, isErr };
