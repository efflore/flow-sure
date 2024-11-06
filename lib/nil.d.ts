import { type Cases } from "./util";
import { Ok } from "./ok";
interface Nil {
    map: (_: any) => Nil;
    chain: (_: any) => Nil;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Ok<T> | Nil;
    catch: (_: any) => Nil;
    match: (cases: Cases<undefined, Error>) => any;
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
    static instance: Nil;
    /**
     * Unwrap the "Nil" value
     *
     * @since 0.9.0
     * @returns {undefined}
     */
    get: () => undefined;
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
