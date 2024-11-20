import { isAsyncFunction, isError, isFunction } from "./util"
import { type Ok, isOk } from "./ok"
import { type Nil, nil, isNil } from "./nil"
import { type Err, err, isErr } from "./err"
import { maybe } from "./maybe"

/* === Types === */

type Result<T> = Ok<T> | Nil | Err<Error>
type MaybeResult<T> = Result<T> | T | Error | null | undefined

/* === Namespace Result === */

/**
 * Get a Result from a function that may throw an error
 * 
 * @since 0.9.6
 * @param {() => MaybeResult<T>} fn - a function that may throw an error
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
 */
const result = /*#__PURE__*/ <T>(
	fn: (...args: any[]) => MaybeResult<T>,
	...args: any[]
): Result<T> => {
	try {
		return wrap(fn(...args))
	} catch (error) {
		return err(error)
	}
}

/**
 * Get an async Result from a function that may throw an error
 * 
 * @since 0.9.6
 * @param {() => Promise<MaybeResult<T>>} fn - async function to try and maybe retry
 * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
const task = /*#__PURE__*/ async <T>(
	fn: (...args: any[]) => Promise<MaybeResult<T>>,
	...args: any[]
): Promise<Result<T>> => {
	try {
		return wrap(await fn(...args))
	} catch (error) {
		return err(error)
	}
}

/**
 * Execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<R>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
const flow = /*#__PURE__*/ async <T, R>(
	...fns: [
		T | (() => MaybeResult<T> | Promise<MaybeResult<T>>),
		...((input: T) => MaybeResult<T> | Promise<MaybeResult<T>>)[]
	]
): Promise<Result<R>> => {
    let res: any = isFunction(fns[0]) ? nil() : wrap(fns.shift())
    for (const fn of fns) {
		if (isErr(res)) break
		if (!isFunction(fn))
			return err(new TypeError('Expected a function in flow'))
		res = isAsyncFunction(fn)
			? await task(async () => fn(res.get()))
			: result(fn, res.get())
    }
    return res
}

/**
 * Check if a value is a Result type
 * 
 * @since 0.9.6
 * @param {any} value - the value to check
 * @returns {boolean} - true if the value is a Result type, false otherwise
 */
const isResult = /*#__PURE__*/ (value: any): value is Result<any> =>
	isOk(value) || isNil(value) || isErr(value)

/**
 * Wrap a value in a Result container if it is not already a Result type
 * 
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a Result or value
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
 */
const wrap = /*#__PURE__*/ <T>(value: MaybeResult<T>): Result<T> =>
	isErr(value) ? value
		: isError(value) ? err(value)
		: maybe(value)

/**
 * Unwrap a Result container, returning the value if it is Ok, or the error if it is Err
 * 
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a value or Result
 * @returns {T | Error | void} - the value or error from the Result
 */
const unwrap = /*#__PURE__*/ <T>(
	value: Result<T> | T | void
): T | Error | void =>
	isErr(value) ? value.error
		: isOk(value) || isNil(value) ? value.get()
		: value

export {
	type Result, type MaybeResult,
	result, task, flow, isResult, wrap, unwrap,
}