/**
 * @name FlowSure
 * @version 0.9.6
 * @author Esther Brunner
 */

/* === Types === */

type Maybe<T> = Ok<T> | Nil
type Result<T> = Ok<T> | Nil | Err<Error>
type MaybeResult<T> = T | Result<T> | undefined
type AsyncResult<T> = Promise<MaybeResult<T>>

type Cases<T, E extends Error> = {
	Ok?: (value: T) => any
	Nil?: () => any
	Err?: (error: E) => any
	// default?: (value: T) => any
}
interface Ok<T> {
    readonly [Symbol.toStringTag]: 'Ok'
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>
    chain: <U>(fn: (value: T) => Result<U>) => Result<U>
    filter: (fn: (value: T) => boolean) => Ok<T> | Nil
    guard: <U extends T>(fn: (value: T) => value is U) => Ok<U> | Nil
    or: (_: any) => Ok<T>
	catch: (_: any) => Ok<T>
	match: (cases: Cases<T, Error>) => any
}

interface Nil {
    readonly [Symbol.toStringTag]: 'Nil'
    map: (_: any) => Nil
    chain: (_: any) => Nil
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Ok<T> | Nil
	catch: (_: any) => Nil
	match: (cases: Cases<undefined, Error>) => any
}

interface Err<E extends Error> {
    readonly [Symbol.toStringTag]: 'Err'
    map: (_: any) => Err<E>
	chain: (_: any) => Err<E>
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Ok<T> | Nil
	catch: <T>(fn: (error: E) => Result<T>) => Result<T>
	match: (cases: Cases<undefined, E>) => any
}

/* === Utility Functions === */

const isFunction = (value: unknown): value is (...args: any[]) => any =>
    typeof value === 'function'

const isAsyncFunction  = (value: unknown): value is (...args: any[]) => Promise<any> | PromiseLike<any> =>
	isFunction(value) && value.prototype.constructor.name === 'AsyncFunction'

const isDefined = (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isInstanceOf = <T>(type: new (...args: any[]) => T) =>
	(value: unknown): value is T =>
		value instanceof type

const noOp = function<T>(this: T) { return this }

/* === Exported Classes === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @class Ok<T>
 * @static of(value: T): Ok<T>
 * @property {NonNullable<T>} value - the value
 * @method get(): NonNullable<T>
 */
class Ok<T> {
	constructor(public readonly value: NonNullable<T>) {}

	/**
	 * Create an Ok value
	 * 
	 * @since 0.9.6
	 * @param {NonNullable<T>} value - the value
	 * @returns {Ok<unknown>} - the Ok instance
	 */
	static of = <T>(value: NonNullable<T>): Ok<T> => new Ok(value)

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
	 * @returns {NonNullable<T>} - the value
	 */
	get(): NonNullable<T> {
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

/**
 * "Nil" singleton, representing a lack of a value
 * 
 * @since 0.9.0
 * @class Nil
 * @static of(): Nil
 * @method get(): undefined
 */
class Nil {
	private static instance = new Nil()
	private constructor() {}

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
	get() {
		return undefined
	}
}

const nilProto = Nil.prototype

nilProto.map = nilProto.chain = nilProto.filter = nilProto.guard = nilProto.catch = noOp

nilProto.match = function (
	this: Nil,
	cases: Cases<undefined, Error>
): any {
	return isFunction(cases.Nil) ? cases.Nil() : this
}

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
	 * Create a new "Err" value from an Error or any other value
	 * 
	 * @since 0.9.6
	 * @param {unknown} error - the error to create an "Err" value from
	 * @returns {Err<Error>} - the new "Err" value
	 */
	static of = (error: any): Err<Error> =>
		new Err(error instanceof Error ? error : new Error(String(error)))

	/**
	 * Check if this is an "Err" value
	 * 
	 * @since 0.9.6
	 * @param {unknown} value - the value to check
	 * @returns {boolean} - whether the value is an "Err" value
	 */
	static isErr = isInstanceOf(Err)

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

errProto.filter = errProto.guard = function() {
	return Nil.of()
}

nilProto.or = errProto.or = function <T>(fn: () => T): Maybe<T> {
	return Maybe.of(fn())
}

errProto.catch = function <T, E extends Error, F extends Error>(
	this: Err<E>,
	fn: (error: E) => Result<T>
): Result<T> {
	console.debug(this)
    return fn(this.error)
}

errProto.match = function <E extends Error>(
    this: Err<E>,
    cases: Cases<undefined, E>
): any {
	return isFunction(cases.Err) ? cases.Err(this.error) : this
}

namespace Maybe {

	/**
     * Wrap a value in a Maybe container if it is not already a Maybe type
     * 
     * @since 0.9.6
     * @param {T} value - a value
	 */
	export const of = <T>(value: T): Maybe<T> =>
		!isDefined(value)
			? Nil.of()
			: isMaybe(value)
				? value as Maybe<T>
				: Ok.of(value)

	/**
	 * Check if a value is a Maybe type
	 * 
	 * @since 0.9.6
	 * @param {unknown} value - the value to check
	 * @returns {boolean} - true if the value is a Maybe type, false otherwise
	 */
	export const isMaybe = (value: unknown): value is Maybe<unknown> =>
		Ok.isOk(value) || Nil.isNil(value)

	/**
	 * Unwrap a Maybe value or return the provided default value
	 * 
	 * @since 0.9.6
	 * @param {Maybe<T> | T | undefined} value - a Maybe value or a value
	 * @returns {T | undefined} - the value or undefined
	 */
	export const unwrap = <T>(value: Maybe<T> | T | undefined): T | undefined =>
		isMaybe(value)
			? value.get()
			: value

}

namespace Result {

	/**
	 * Wrap a value in a Result container if it is not already a Result type
	 * 
	 * @since 0.9.6
	 * @param {MaybeResult<T>} value - a Result or value
	 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
	 */
	export const of = <T>(value: MaybeResult<T>): Result<T> =>
        !isDefined(value)
			? Nil.of()
			: isResult(value)
				? value
				: isInstanceOf(Error)(value)
				    ? Err.of(value)
					: Ok.of(value)
	
	/**
	 * Create a Result from a function that may throw an error
	 * 
	 * @since 0.9.6
	 * @param {() => MaybeResult<T>} fn - a function that may throw an error
	 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
	 */
	export const from = <T>(fn: () => MaybeResult<T>): Result<T> => {
		try {
			return of(fn())
		} catch (error) {
			return Err.of(error)
		}
	}

	/**
	 * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
	 * 
	 * @since 0.9.6
	 * @param {() => AsyncResult<T>} fn - async function to try and maybe retry
	 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
	 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
	 * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
	 */
	export const fromAsync = async <T>(
		fn: () => Promise<T>,
		retries: number = 0,
		delay: number = 1000
	): Promise<Result<T>> => {
		try {
			return of(await fn())
		} catch (error) {
			if (retries < 1) return Err.of(error)
			await new Promise((res) => setTimeout(res, delay))
            return fromAsync(fn, retries - 1, delay * 2)
		}
	}

	/**
	 * Check if a value is a Result type
	 * 
	 * @since 0.9.6
	 * @param {unknown} value - the value to check
	 * @returns {boolean} - true if the value is a Result type, false otherwise
	 */
    export const isResult = (value: unknown): value is Result<unknown> =>
        Ok.isOk(value) || Nil.isNil(value) || Err.isErr(value)

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
        Err.isErr(value)
            ? value.error
            : Maybe.unwrap(value)
}

/* === Exported Functions === */

/* const match = function<T>(
	value: T,
	cases: Cases<T>
) {
    for (const [predicate, handler] of Object.entries(cases)) {
        if (isFunction(predicate) && predicate(value)) return handler(value)
    }
    if (cases.default) return cases.default(value)
    else return getResult(value)
} */

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
async function flow<T>(
	...fns: [
		T | (() => MaybeResult<T> | AsyncResult<T>),
		...((input: T) => MaybeResult<T> | AsyncResult<T>)[]
	]
): Promise<Result<any>> {
    let result: any = isFunction(fns[0]) ? Nil.of() : Maybe.of(fns.shift())
    for (const fn of fns) {
		if (Err.isErr(result)) break
		if (!isFunction(fn))
			return Err.of(new TypeError('Expected a function in flow'))
		result = isAsyncFunction(fn)
			? await Result.fromAsync(async () => fn(result.get()))
			: Result.from(() => fn(result.get()))
    }
    return result
}

export {
	type MaybeResult, type AsyncResult, type Cases,
	isDefined, isFunction, isAsyncFunction,
	Ok, Nil, Err, Maybe, Result, flow
}
