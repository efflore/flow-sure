import { type Ok, ok, isOk } from "./ok"
import { type Nil, nil, isNil } from "./nil"

/* === Types === */

type Maybe<T> = Ok<T> | Nil
type MaybeMaybe<T> = Maybe<T> | T | null | undefined

/* === Namespace Maybe === */

/**
 * Wrap a value in a Maybe container if it is not already a Maybe type
 * 
 * @since 0.9.6
 * @param {MaybeMaybe<T>} value - a value
 */
const maybe = /*#__PURE__*/ <T>(value?: MaybeMaybe<T>): Maybe<T> =>
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
const isMaybe = /*#__PURE__*/ (value: any): value is Maybe<any> =>
	isOk(value) || isNil(value)

export { type Maybe, type MaybeMaybe, maybe, isMaybe }