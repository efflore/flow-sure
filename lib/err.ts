
import { type Cases, isError, isFunction, isInstanceOf } from "./util"
import { type Nil, nil } from "./nil"
import { type Maybe, maybe } from "./maybe"
import { type MaybeResult, type Result, result } from "./result"

/* === Class Err === */

/**
 * Create a "Err" value, representing a failure
 * 
 * @since 0.9.0
 * @class Err<E extends Error>
 * @property error - the error
 * @method get(): @throws E
 */
class Err<E extends Error> {
	constructor(public readonly error: E) {}

	/**
	 * No-op methods for Err
	 */
	map(_: any): Err<E> { return this }
	chain(_: any): Err<E> { return this }
	async await(_: any): Promise<Err<E>> { return this }

	/**
	 * Filter the error
	 */
	filter = /*#__PURE__*/ (_: any): Nil => nil()
	guard = /*#__PURE__*/ (_: any): Nil => nil()

	/**
     * Provide an alternative value
     * 
     * @since 0.9.0
	 * @param {() => T} fn - a function that returns an alternative value
     * @returns {Maybe<T>} - a new "Ok" containing the alternative value or "Nil"
	 */
	or = /*#__PURE__*/ <T>(fn: (error: E) => T): Maybe<T> => maybe(fn(this.error))

	/**
	 * Catch an error and return a new "Maybe" containing the result of the passed through function
	 * 
	 * @since 0.9.0
	 * @param {function} fn - a function that takes the error and returns a new "Maybe"
	 * @returns {Maybe<T>} - a new "Maybe" containing the result of the passed through function
	 */
	catch = /*#__PURE__*/ <T>(fn: (error: E) => MaybeResult<T>): Result<T> => result(() => fn(this.error))

	/**
	 * Match Err with a set of cases
	 * 
	 * @since 0.9.0
	 * @param {Cases<undefined, E>} cases - a set of cases to match against
	 * @returns {any} - the result of matching the cases or the passed through "Err"
	 */
	match(cases: Cases<undefined, E>): any {
		return isFunction(cases.Err) ? cases.Err(this.error) : this
	}

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
const isErr = isInstanceOf(Err)

export { Err, err, isErr }