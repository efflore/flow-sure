import { type Cases, isFunction, isInstanceOf, noOp } from './util'
import { Nil } from './nil'
import type { Maybe } from './maybe'
import type { Result } from './result'

/* === Types === */

export interface Ok<T> {
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>
    chain: <U>(fn: (value: T) => Result<U>) => Result<U>
    filter: (fn: (value: T) => boolean) => Ok<T> | Nil
    guard: <U extends T>(fn: (value: T) => value is U) => Ok<U> | Nil
    or: (_: any) => Ok<T>
	catch: (_: any) => Ok<T>
	match: (cases: Cases<T, Error>) => any
}

/* === Class === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @class Ok<T>
 * @static of(value: T): Ok<T>
 * @property {NonNullable<T>} value - the value
 * @method get(): NonNullable<T>
 */
export class Ok<T> {
	constructor(public readonly value: T) {}

	/**
	 * Create an Ok value
	 * 
	 * @since 0.9.6
	 * @param {NonNullable<T>} value - the value
	 * @returns {Ok<T>} - the Ok instance
	 */
	static of = <T>(value: T): Ok<T> => new Ok(value)

	/**
	 * Check if the Ok value is an instance of Ok
	 * 
	 * @since 0.9.6
	 * @param {unknown} value - the value to check
	 * @returns {boolean} - true if the value is an instance of Ok
	 */
	static isOk = isInstanceOf(Ok)

	/**
	 * Unwrap the Ok value
	 * 
	 * @since 0.9.0
	 * @returns {T} - the value
	 */
	get(): T {
		return this.value
	}
}

const okProto = Ok.prototype

okProto.map = function <T, U extends {}>(
	this: Ok<T>,
	fn: (value: T) => U
): Ok<U> {
	return new Ok(fn(this.value))
}

okProto.chain = function <T, U>(
	this: Ok<T>,
	fn: (value: T
) => Result<U>): Result<U> {
    return fn(this.value)
}

okProto.filter = okProto.guard = function <T>(
    this: Ok<T>,
    fn: (value: T) => boolean
): Maybe<T> {
	return fn(this.value) ? this : Nil.of()
}

okProto.or = okProto.catch = noOp

okProto.match = function <T>(
    this: Ok<T>,
    cases: Cases<T, Error>
): any {
	return isFunction(cases.Ok) ? cases.Ok(this.value) : this
}
