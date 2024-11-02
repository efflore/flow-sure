import { isError, isFunction } from "./util"
import { Ok } from "./ok"
import { Nil } from "./nil"
import { Err } from "./err"

/* === Types === */

export type Result<T> = Ok<T> | Nil | Err<Error>
export type MaybeResult<T> = T | Error | Result<T> | undefined

/* === Namespace Result === */

/**
 * Wrap a value in a Result container if it is not already a Result type
 * 
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a Result or value
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
 */
export const of = <T>(value: MaybeResult<T>): Result<T> =>
	value == null ? Nil.of()
		: isResult(value) ? value
		: isError(value) ? Err.of(value)
		: Ok.of(value)

/**
 * Create a Result from a function that may throw an error
 * 
 * @since 0.9.6
 * @param {() => MaybeResult<T>} fn - a function that may throw an error
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
 */
export const from = <T>(
	fn: (...args: any[]) => MaybeResult<T>,
	...args: any[]
): Result<T> => {
	try {
		return of(fn(...args))
	} catch (error) {
		return Err.of(error)
	}
}

/**
 * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
 * 
 * @since 0.9.6
 * @param {() => Promise<MaybeResult<T>>} fn - async function to try and maybe retry
 * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
export const fromAsync = async <T>(
	fn: (...args: any[]) => Promise<MaybeResult<T>>,
	...args: any[]
): Promise<Result<T>> => {
	try {
		return of(await fn(...args))
	} catch (error) {
		return Err.of(error)
	}
}

/**
 * Check if a value is a Result type
 * 
 * @since 0.9.6
 * @param {any} value - the value to check
 * @returns {boolean} - true if the value is a Result type, false otherwise
 */
export const isResult = (value: any): value is Result<any> =>
	Ok.isOk(value) || Nil.isNil(value) || Err.isErr(value)

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
export const flow = async <T>(
	...fns: [
		T | (() => MaybeResult<T> | Promise<MaybeResult<T>>),
		...((input: T) => MaybeResult<T> | Promise<MaybeResult<T>>)[]
	]
): Promise<Result<any>> => {
    let result: any = isFunction(fns[0]) ? Nil.of() : of(fns.shift())
    for (const fn of fns) {
		if (Err.isErr(result)) break
		if (!isFunction(fn))
			return Err.of(new TypeError('Expected a function in flow'))
		result = /^async\s+/.test(fn.toString())
			? await fromAsync(async () => fn(result.get()))
			: from(fn, result.get())
    }
    return result
}

/**
 * Unwrap a Result container, returning the value if it is Ok, or the error if it is Err
 * 
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a value or Result
 * @returns {T | Error | undefined} - the value or error from the Result
 */
export const unwrap = <T>(
	value: Result<T> | T | undefined
): T | Error | undefined =>
	Err.isErr(value) ? value.error
		: Ok.isOk(value) || Nil.isNil(value) ? value.get()
		: value
