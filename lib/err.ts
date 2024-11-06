
import { type Cases, isError, isFunction, isInstanceOf, noOp } from "./util"
import type { Ok } from "./ok"
import { type Nil, nil } from "./nil"
import { type Maybe, maybe } from "./maybe"
import type { Result } from "./result"

/* === Types === */

interface Err<E extends Error> {
    map: (_: any) => Err<E>
	chain: (_: any) => Err<E>
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Ok<T> | Nil
	catch: <T>(fn: (error: E) => Result<T>) => Result<T>
	match: (cases: Cases<undefined, E>) => any
}

/* === Class Err === */

/**
 * Create a "Err" value, representing a failure
 * 
 * @since 0.9.0
 * @class Err<E extends Error>
 * @property error - the error
 * @static of(error: any): Err<E>
 * @method get(): @throws E
 */
class Err<E extends Error> {
	constructor(public readonly error: E) {}

	/**
	 * Re-throw the contained error
	 * 
	 * @since 0.9.0
	 * @throws E
	 */
	get() {
		throw this.error
	}
}

const errProto = Err.prototype

errProto.map = errProto.chain = noOp

errProto.filter = errProto.guard = /*#__PURE__*/ () => nil()

errProto.or = /*#__PURE__*/ <T>(fn: () => T): Maybe<T> => maybe(fn())

errProto.catch = function <T, E extends Error>(
	this: Err<E>,
	fn: (error: E) => Result<T>
): Result<T> {
    return fn(this.error)
}

errProto.match = function <E extends Error>(
    this: Err<E>,
    cases: Cases<undefined, E>
): any {
	return isFunction(cases.Err) ? cases.Err(this.error) : this
}

/**
 * Create a new "Err" value from an Error or any other value
 * 
 * @since 0.9.6
 * @param {unknown} error - the error to create an "Err" value from
 * @returns {Err<Error>} - the new "Err" value
 */
const err = /*#__PURE__*/ (error: unknown): Err<Error> =>
	new Err(isError(error) ? error : new Error(String(error)))

/**
 * Check if this is an "Err" value
 * 
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - whether the value is an "Err" value
 */
const isErr = /*#__PURE__*/ isInstanceOf(Err)

export { Err, err, isErr }