import { type Cases } from "./util";
import { type Maybe } from "./maybe";
/**
 * "Nil" result, representing a lack of a value
 *
 * @since 0.9.0
 * @class Nil
 * @method get(): void - does nothing and returns `void`
 */
declare class Nil {
    static instance: Nil;
    /**
     * No-op methods for Nil
     */
    map(_: any): Nil;
    chain(_: any): Nil;
    await(_: any): Promise<Nil>;
    filter(_: any): Nil;
    guard(_: any): Nil;
    catch(_: any): Nil;
    /**
     * Provide an alternative value
     *
     * @since 0.9.0
     * @param {() => T} fn - a function that returns an alternative value
     * @returns {Maybe<T>} - a new "Ok" containing the alternative value or "Nil"
     */
    or: <T>(fn: () => T) => Maybe<T>;
    /**
     * Match Nil with a set of cases
     *
     * @since 0.9.0
     * @param {Cases<undefined, Error>} cases - a set of cases to match against
     * @returns {any} - the result of matching the cases or the passed through "Nil"
     */
    match(cases: Cases<undefined, Error>): any;
    /**
     * Unwrap the "Nil" value
     *
     * @since 0.9.0
     * @returns {void}
     */
    get: () => void;
}
/**
 * Get the singleton "Nil" instance
 *
 * @since 0.9.6
 * @returns {Nil}
 */
declare const nil: () => Nil;
/**
 * Check if the given value is "Nil"
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - whether the value is "Nil"
 */
declare const isNil: (value: unknown) => value is Nil;
export { Nil, nil, isNil };
