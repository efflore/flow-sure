
import { type Cases, isFunction, noOp } from "./util"
import { Ok } from "./ok"
import { type Maybe, of } from "./maybe"

/* === Types === */

export interface Nil {
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
export class Nil {
	private static instance = new Nil()

	/**
	 * Get the singleton "Nil" instance
	 * 
	 * @since 0.9.6
	 * @returns {Nil}
	 */
	static of = (): Nil => Nil.instance

	/**
	 * Check if the given value is "Nil"
	 * 
	 * @since 0.9.6
	 * @param {unknown} value - the value to check
	 * @returns {boolean} - whether the value is "Nil"
	 */
	static isNil = (value: unknown): value is Nil  =>
		value === Nil.instance
	
	/**
	 * Unwrap the "Nil" value
	 * 
	 * @since 0.9.0
	 * @returns {undefined}
	 */
	get = (): undefined => undefined
}

const nilProto = Nil.prototype

nilProto.map = nilProto.chain = nilProto.filter = nilProto.guard = nilProto.catch = noOp

nilProto.or = <T>(fn: () => T): Maybe<T> => of(fn())

nilProto.match = function (
	this: Nil,
	cases: Cases<undefined, Error>
): any {
	return isFunction(cases.Nil) ? cases.Nil() : this
}

export default Nil