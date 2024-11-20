import { type Cases, isFunction, isInstanceOf, isMutable, tryClone } from './util'
import { nil } from './nil'
import { err } from './err'
import type { Maybe } from './maybe'
import { type MaybeResult, type Result, result, task } from './result'

/* === Constants === */

const consumedError = new ReferenceError('Mutable reference has already been consumed')
const UNSET: any = Symbol()

/* === Class Ok === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @class Ok<T>
 * @property {NonNullable<T>} value - the value
 */
class Ok<T> {
	private value: T
	private mut: boolean

	constructor(value: T) {
		this.value = tryClone(value, false)
		this.mut = isMutable(value)
	}

	/**
	 * Check if the Ok value has been consumed
	 */
	get gone(): boolean {
		return this.value === UNSET
    }

	/**
     * Apply a function to the Ok value and return a new Ok instance
     * 
     * @since 0.9.0
     * @param {(value: T) => NonNullable<U>} fn - the function to apply
	 * @returns {Ok<U>} - a new Ok instance with the result of the function applied to the value
	 */
	map<U extends {}>(fn: (value: T) => NonNullable<U>): Ok<U> {
		if (this.gone) throw consumedError
        return ok(fn(this.value))
    }

	/**
	 * Apply a function to the Ok value and return its resulting Result instance
	 * 
	 * @since 0.9.0
	 * @param {(value: T) => MaybeResult<U>} fn - the function to apply
	 * @returns {Result<U>} - the new Result instance of the function applied to the value
	 */
	chain<U>(fn: (value: T) => MaybeResult<U>): Result<U> {
        return this.gone ? err(consumedError) : result(() => fn(this.value))
    }

	/**
	 * Apply an asynchronous function to the Ok value and return its resulting Result instance
	 * 
	 * @since 0.9.0
	 * @param {(value: T) => Promise<MaybeResult<U>>} fn - the async function to apply
	 * @returns {Promise<Result<U>>} - the new Result instance wrapped in a Promise
	 */
	async await<U>(fn: (value: T) => Promise<MaybeResult<U>>): Promise<Result<U>> {
		return this.gone ? Promise.resolve(err(consumedError)) : task(() => fn(this.value))
	}

	/**
	 * Filter the Ok value based on a predicate function
	 * 
	 * @since 0.9.0
	 * @param {function} fn - the predicate function
	 * @returns {Maybe<T>} - the Ok instance with filtered value if the predicate function returns true, otherwise nil()
	 */
	filter(fn: (value: T) => boolean): Maybe<T> {
        return !this.gone && fn(this.value) ? this : nil()
    }
	guard<U extends T>(fn: (value: T) => value is U): Maybe<T> {
		return this.filter(fn)
    }

	/**
	 * No-op methods for Ok
	 */
	or(_: any): Ok<T> { return this }
	catch(_: any): Ok<T> { return this }

	/**
	 * Match the Ok value with a set of cases
	 * 
	 * @since 0.9.0
	 * @param {Cases<T>} cases - a set of cases to match against
	 * @returns {any} - the result of the Ok function in cases or the original Ok instance
	 */
	match(cases: Cases<T, Error>): any {
		if (this.gone) return isFunction(cases.Gone) ? cases.Gone() : err(consumedError)
		return isFunction(cases.Ok) ? cases.Ok(this.value) : this
    }

	/**
	 * Unwrap the Ok value
	 * 
	 * @since 0.9.0
	 * @returns {T | never} - the value or throws an error if the value has already been consumed
	 */
	get(): T | never {
		if (this.gone) throw consumedError
		const val = this.value
		if (this.mut) this.value = UNSET
		return val
	}
}

/**
 * Create an Ok value
 * 
 * @since 0.9.6
 * @param {NonNullable<T>} value - the value
 * @returns {Ok<T>} - the Ok instance
 */
const ok = /*#__PURE__*/ <T>(value: T): Ok<T> => new Ok(value)

/**
 * Check if a value is an instance of Ok
 * 
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is an instance of Ok
 */
const isOk = isInstanceOf(Ok)

/**
 * Check if the Ok value has been consumed
 * 
 * @since 0.10.0
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the Ok value has been consumed
 */
const isGone = (value: unknown): boolean =>
	isOk(value) && value.gone

export { Ok, ok, isOk, isGone }