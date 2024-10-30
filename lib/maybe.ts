import { isDefined } from "./util"
import { Ok } from "./ok"
import { Nil } from "./nil"

/* === Types === */

export type Maybe<T> = Ok<T> | Nil

/* === Namespace Maybe === */

/**
 * Wrap a value in a Maybe container if it is not already a Maybe type
 * 
 * @since 0.9.6
 * @param {T} value - a value
 */
export const of = <T>(value: T): Maybe<T> =>
	!isDefined(value)
		? Nil.of()
		: isMaybe(value)
			? value as Maybe<T>
			: Ok.of(value)

/**
 * Check if a value is a Maybe type
 * 
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is a Maybe type, false otherwise
 */
export const isMaybe = (value: unknown): value is Maybe<unknown> =>
	Ok.isOk(value) || Nil.isNil(value)

/**
 * Unwrap a Maybe value or return the provided default value
 * 
 * @since 0.9.6
 * @param {Maybe<T> | T | undefined} value - a Maybe value or a value
 * @returns {T | undefined} - the value or undefined
 */
export const unwrap = <T>(value: Maybe<T> | T | undefined): T | undefined =>
	isMaybe(value)
		? value.get()
		: value
