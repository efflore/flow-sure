
import { type Cases, isFunction } from "./util"
import { type Maybe, maybe } from "./maybe"

/* === Class Nil === */

/**
 * "Nil" result, representing a lack of a value
 * 
 * @since 0.9.0
 * @class Nil
 * @method get(): void - does nothing and returns `void`
 */
class Nil {
	static instance = new Nil()

	/**
	 * No-op methods for Nil
	 */
	map(_: any): Nil { return this }
	chain(_: any): Nil { return this }
	async await(_: any): Promise<Nil> { return this }
	filter(_: any): Nil { return this }
	guard(_: any): Nil { return this }
	catch(_: any): Nil { return this }

	/**
     * Provide an alternative value
     * 
     * @since 0.9.0
	 * @param {() => T} fn - a function that returns an alternative value
     * @returns {Maybe<T>} - a new "Ok" containing the alternative value or "Nil"
	 */
	or = /*#__PURE__*/ <T>(fn: () => T): Maybe<T> => maybe(fn())

	/**
	 * Match Nil with a set of cases
	 * 
	 * @since 0.9.0
	 * @param {Cases<undefined, Error>} cases - a set of cases to match against
	 * @returns {any} - the result of matching the cases or the passed through "Nil"
	 */
	match(cases: Cases<undefined, Error>): any {
		return isFunction(cases.Nil) ? cases.Nil() : this
	}
	
	/**
	 * Unwrap the "Nil" value
	 * 
	 * @since 0.9.0
	 * @returns {void}
	 */
	get = /*#__PURE__*/ (): void => {}
}

/**
 * Get the singleton "Nil" instance
 * 
 * @since 0.9.6
 * @returns {Nil}
 */
const nil = /*#__PURE__*/ (): Nil => Nil.instance

/**
 * Check if the given value is "Nil"
 * 
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - whether the value is "Nil"
 */
const isNil = /*#__PURE__*/ (value: unknown): value is Nil  =>
	value === Nil.instance

export { Nil, nil, isNil }