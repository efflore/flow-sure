import { type Cases } from "./util";
import { Ok } from "./ok";
export interface Nil {
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
export declare class Nil {
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
export default Nil;
