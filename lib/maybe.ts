import { type Ok, ok, isOk } from "./ok"
import { type Nil, nil, isNil } from "./nil"

/* === Types === */

export type Maybe<T> = Ok<T> | Nil

/* === Namespace Maybe === */

/**
 * Wrap a value in a Maybe container if it is not already a Maybe type
 * 
 * @since 0.9.6
 * @param {T} value - a value
 */
export const maybe = /*#__PURE__*/ <T>(value: T): Maybe<T> =>
	value == null ? nil()
		: isMaybe(value) ? value
		: ok(value)

/**
 * Check if a value is a Maybe type
 * 
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is a Maybe type, false otherwise
 */
export const isMaybe = /*#__PURE__*/ (value: any): value is Maybe<any> =>
	isOk(value) || isNil(value)
