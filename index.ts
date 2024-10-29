/**
 * @name FlowSure
 * @version 0.9.5
 * @author Esther Brunner
 */

/* === Types === */

interface Ok<T> {
    readonly [Symbol.toStringTag]: 'Ok'
    map: <U extends {}>(fn: (value: T) => U) => Ok<U>
    chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>
    filter: (fn: (value: T) => boolean) => Maybe<T>
    guard: <U extends T>(fn: (value: T) => value is U) => Maybe<U>
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
    or: <T>(fn: () => T) => Maybe<T>
	catch: (_: any) => Nil
	match: (cases: Cases<undefined, Error>) => any
}

interface Err<E extends Error> {
    readonly [Symbol.toStringTag]: 'Err'
    map: (_: any) => Err<E>
	chain: (_: any) => Err<E>
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Maybe<T>
	catch: <T, F extends Error>(fn: (error: E) => Result<T, F>) => Result<T, F>
	match: (cases: Cases<undefined, E>) => any
}

type Maybe<T> = Ok<T> | Nil

type Result<T, E extends Error> = Ok<T> | Nil | Err<E>

type MaybeResult<T, E extends Error> =
	T | Result<T, E> | undefined

type AsyncResult<T, E extends Error> = 
    MaybeResult<T, E> | Promise<MaybeResult<T, E>> | PromiseLike<MaybeResult<T, E>>

type Cases<T, E extends Error> = {
    Ok?: (value: T) => any
    Nil?: () => any
    Err?: (error: E) => any
	// default?: (value: T) => any
}

/* === Utility Functions === */

const isFunction = (value: unknown): value is Function =>
    typeof value === 'function'

const isDefined = (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isOk = <T>(value: unknown): value is Ok<T> =>
	value instanceof Ok

const isNil = (value: unknown): value is Nil =>
	value instanceof Nil

const isErr = <E extends Error>(value: unknown): value is Err<E> =>
	value instanceof Err

const isMaybe = <T>(value: unknown): value is Maybe<T> =>
	isOk(value) || isNil(value)

const isResult = <T, E extends Error>(value: unknown): value is Result<T, E> =>
	isOk(value) || isNil(value) || isErr(value)

const getResult = <T, E extends Error>(value: MaybeResult<T, E>): Result<T, E> =>
	isErr(value) ? value : ensure(value)

const noOp = function<T>(this: T) { return this }

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
 * Create an option for a given value to gracefully handle nullable values
 * 
 * @since 0.9.0
 * @param {T | Maybe<T> | null | undefined} value - value to wrap in an array
 * @returns {Maybe<T>} - option of either Ok or Nil, depending on whether the input is nullish
 */
const ensure = <T>(value: T | Maybe<T> | null | undefined): Maybe<T> =>
	!isDefined(value) ? Nil.of() : isMaybe(value) ? value : Ok.of(value)

/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 * 
 * @since 0.9.0
 * @param {() => T | Result<T>} fn - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
const attempt = <T, E extends Error>(fn: () => T | Result<T, E>): Result<T, E> => {
	try {
		return getResult(fn())
    } catch (error) {
        return Err.of(error) as Err<E>
    }
}

/**
 * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
 * 
 * @since 0.9.0
 * @param {() => AsyncResult<T, E>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<Result<T, E>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
const gather = async <T, E extends Error>(
    fn: () => AsyncResult<T, E>,
    retries: number = 0,
    delay: number = 1000
): Promise<Result<T, E>> => {
    const task = async (retries: number, delay: number): Promise<Result<T, E>> => {
        return Promise.resolve(fn())
            .then(getResult)
            .catch(async (error) => {
                if (retries < 1) return Err.of(error) as Err<E>
                await new Promise(resolve => setTimeout(resolve, delay)) // wait for the delay
                return task(retries - 1, delay * 2) // retry with exponential backoff
            })
    }
    return await task(retries, delay)
}

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T, E>), ...((input: T) => AsyncResult<T, E>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
async function flow<T, E extends Error>(
	...fns: [T | (() => AsyncResult<T, E>), ...((input: T) => AsyncResult<T, E>)[]]
): Promise<Result<any, E>> {
    let result: any = isFunction(fns[0]) ? Nil.of() : ensure(fns.shift())
    for (const fn of fns) {
		if (isErr(result)) break
		if (!isFunction(fn))
			return Err.of(new TypeError('Expected a function in flow')) as Err<E>
		result = await gather(() => fn(result.get()))
    }
    return result
}

/* === Exported Classes === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T, E>} - "Ok" value with the given value
 */
class Ok<T> {
	static of = (value: NonNullable<any>) => new Ok(value)
	constructor(public readonly value: NonNullable<T>) {}
	get() { return this.value }
}

const okProto = Ok.prototype

okProto.map = function <T, U extends {}>(
	this: Ok<T>,
	fn: (value: T) => U
): Ok<U> {
	return Ok.of(fn(this.value))
}

okProto.chain = function <T, U, E extends Error>(
	this: Ok<T>,
	fn: (value: T
) => Result<U, E>): Result<U, E> {
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
 * Create a "Nil" value, representing a lack of a value
 * 
 * @since 0.9.0
 * @returns {Nil} - "Nil" value
 */
class Nil {
	static of = () => new Nil()
	get() { return undefined }
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
 * @param {E} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
class Err<E extends Error> {
	static of = (error: any) =>
		new Err(error instanceof Error ? error : new Error(String(error)))
    constructor(public readonly error: E) {}
	get() { throw this.error }
}

const errProto = Err.prototype

errProto.map = errProto.chain = noOp

errProto.filter = errProto.guard = function() {
	return Nil.of()
}

nilProto.or = errProto.or = function <T>(fn: () => T): Maybe<T> {
	return ensure(fn())
}

errProto.catch = function <T, E extends Error, F extends Error>(
	this: Err<E>,
	fn: (error: E) => Result<T, F>
): Result<T, F> {
	console.debug(this)
    return fn(this.error)
}

errProto.match = function <E extends Error>(
    this: Err<E>,
    cases: Cases<undefined, E>
): any {
	return isFunction(cases.Err) ? cases.Err(this.error) : this
}

export {
	type Maybe, type Result, type MaybeResult, type AsyncResult, type Cases,
	isDefined, isFunction, isOk, isNil, isErr, isMaybe, isResult,
	Ok, Nil, Err, ensure, attempt, gather, flow
}
