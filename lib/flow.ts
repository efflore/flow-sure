
/* === Exported Function === */

import { Nil } from "./nil"
import { Err } from "./err"
import { of } from "./maybe"
import { type AsyncResult, type MaybeResult, type Result, from, fromAsync } from "./result"
import { isFunction } from "./util"

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
export const flow = async <T>(
	...fns: [
		T | (() => MaybeResult<T> | AsyncResult<T>),
		...((input: T) => MaybeResult<T> | AsyncResult<T>)[]
	]
): Promise<Result<any>> => {
    let result: any = isFunction(fns[0]) ? Nil.of() : of(fns.shift())
    for (const fn of fns) {
		if (Err.isErr(result)) break
		if (!isFunction(fn))
			return Err.of(new TypeError('Expected a function in flow'))
		result = /^async\s+/.test(fn.toString())
			? await fromAsync(async () => fn(result.get()))
			: from(() => fn(result.get()))
    }
    return result
}
