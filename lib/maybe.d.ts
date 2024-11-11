import { type Ok } from "./ok";
import { type Nil } from "./nil";
export type Maybe<T> = Ok<T> | Nil;
/**
 * Wrap a value in a Maybe container if it is not already a Maybe type
 *
 * @since 0.9.6
 * @param {T} value - a value
 */
export declare const maybe: <T>(value?: T) => Maybe<T>;
/**
 * Check if a value is a Maybe type
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is a Maybe type, false otherwise
 */
export declare const isMaybe: (value: any) => value is Maybe<any>;
