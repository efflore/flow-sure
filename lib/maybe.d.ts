import { type Ok } from "./ok";
import { type Nil } from "./nil";
type Maybe<T> = Ok<T> | Nil;
type MaybeMaybe<T> = Maybe<T> | T | null | undefined;
/**
 * Wrap a value in a Maybe container if it is not already a Maybe type
 *
 * @since 0.9.6
 * @param {MaybeMaybe<T>} value - a value
 */
declare const maybe: <T>(value?: MaybeMaybe<T>) => Maybe<T>;
/**
 * Check if a value is a Maybe type
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is a Maybe type, false otherwise
 */
declare const isMaybe: (value: any) => value is Maybe<any>;
export { type Maybe, type MaybeMaybe, maybe, isMaybe };
