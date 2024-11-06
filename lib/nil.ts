
import { type Cases, isFunction, noOp } from "./util"
import { Ok } from "./ok"
import { type Maybe, maybe } from "./maybe"

/* === Types === */

interface Nil {
    map: (_: any) => Nil
    chain: (_: any) => Nil
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Ok<T> | Nil
	catch: (_: any) => Nil
	match: (cases: Cases<undefined, Error>) => any
}

/* === Class Nil === */

/**
 * "Nil" singleton, representing a lack of a value
 * 
 * @since 0.9.0
 * @class Nil
 * @static of(): Nil
 * @method get(): undefined
 */
class Nil {
	static instance = new Nil()
	
	/**
	 * Unwrap the "Nil" value
	 * 
	 * @since 0.9.0
	 * @returns {undefined}
	 */
	get = /*#__PURE__*/ (): undefined => undefined
}

const nilProto = Nil.prototype

nilProto.map = nilProto.chain = nilProto.filter = nilProto.guard = nilProto.catch = noOp

nilProto.or = /*#__PURE__*/ <T>(fn: () => T): Maybe<T> => maybe(fn())

nilProto.match = function (
	this: Nil,
	cases: Cases<undefined, Error>
): any {
	return isFunction(cases.Nil) ? cases.Nil() : this
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