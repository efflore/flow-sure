import { type Cases } from "./util";
import type { Ok } from "./ok";
import { Nil } from "./nil";
import type { Result } from "./result";
export interface Err<E extends Error> {
    map: (_: any) => Err<E>;
    chain: (_: any) => Err<E>;
    filter: (_: any) => Nil;
    guard: (_: any) => Nil;
    or: <T>(fn: () => T) => Ok<T> | Nil;
    catch: <T>(fn: (error: E) => Result<T>) => Result<T>;
    match: (cases: Cases<undefined, E>) => any;
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
export declare class Err<E extends Error> {
    readonly error: E;
    constructor(error: E);
    /**
     * Create a new "Err" value from an Error or any other value
     *
     * @since 0.9.6
     * @param {unknown} error - the error to create an "Err" value from
     * @returns {Err<Error>} - the new "Err" value
     */
    static of: (error: unknown) => Err<Error>;
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
export default Err;