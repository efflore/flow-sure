/* === Types === */

type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok'
    value: T
    map: <U>(fn: (value: T) => U) => Ok<U>
    chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>
    filter: (fn: (value: T) => boolean) => Maybe<T>
    guard: <U extends T>(fn: (value: T) => value is U) => Maybe<U>
    or: (_: any) => Ok<T>
	catch: (_: any) => Ok<T>
	match: <U, F extends Error>(cases: Cases<T, Error, U, F>) => Result<U, F>
    get: () => T
}

type Nil = {
    readonly [Symbol.toStringTag]: 'Nil'
    map: (_: any) => Nil
    chain: (_: any) => Nil
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Maybe<T>
	catch: (_: any) => Nil
	match: <U, F extends Error>(cases: Cases<any, Error, U, F>) => Result<U, F>
    get: () => undefined
}

type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err'
    error: E
    map: (_: any) => Err<E>
	chain: (_: any) => Err<E>
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(fn: () => T) => Maybe<T>
	catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => Result<U, F>
	match: <U, F extends Error>(cases: Cases<any, E, U, F>) => Result<U, F>
    get: () => never
}

type Maybe<T> = Ok<T> | Nil

type Result<T, E extends Error> = Ok<T> | Nil | Err<E>

type AsyncResult<T, E extends Error> = 
    T | Result<T, E> | Promise<T | Result<T, E>> | PromiseLike<T | Result<T, E>>

type Cases<T, E extends Error, U, F extends Error> = {
    [TYPE_OK]?: (value: T) => Result<U, F>
    [TYPE_NIL]?: () => Result<U, F>
    [TYPE_ERR]?: (error: E) => Result<U, F>
}

/* === Constants === */

const TYPE_OK = 'Ok'
const TYPE_NIL = 'Nil'
const TYPE_ERR = 'Err'

/* === Utility Functions === */

const isFunction = (value: unknown): value is Function =>
    typeof value === 'function'

const isDefined = (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isDefinedObject = (value: unknown): value is Record<PropertyKey, unknown> =>
	typeof value === 'object' && isDefined(value)

const isObjectOfType = <T>(value: unknown, type: string): value is T =>
	isDefinedObject(value) && (value[Symbol.toStringTag] === type)

const isOk = <T>(value: unknown): value is Ok<T> =>
	isObjectOfType(value, TYPE_OK)

const isNil = (value: unknown): value is Nil =>
	isObjectOfType(value, TYPE_NIL)

const isErr = <E extends Error>(value: unknown): value is Err<E> =>
	isObjectOfType(value, TYPE_ERR)

const isMaybe = <T>(value: unknown): value is Maybe<T> =>
	isOk(value) || isNil(value)

const isResult = <T, E extends Error>(value: unknown): value is Result<T, E> =>
	isOk(value) || isNil(value) || isErr(value)

const errOrEnsure = <T, E extends Error>(value: T | Result<T, Error>): Result<T, E> =>
	isErr(value) ? value as Err<E> : ensure(value)

const wrapErr = <E extends Error>(error: unknown): Err<E> =>
	Err(error instanceof Error ? error as E : new Error(String(error)) as E)

/* === Exported Functions === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T, E>} - "Ok" value with the given value
 */
const Ok = <T>(value: T): Ok<T> => ({
	[Symbol.toStringTag]: TYPE_OK,
	value,
	map: <U>(fn: (value: T) => U) => Ok(fn(value)),
	chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => fn(value),
	filter: (fn: (value: T) => boolean) => fn(value) ? Ok<T>(value) : Nil(),
	guard: <U extends T>(fn: (value: T) => value is U) => fn(value) ? Ok<U>(value) : Nil(),
	or: () => Ok(value),
	catch: () => Ok(value),
	match: <U, F extends Error>(cases: Cases<T, Error, U, F>) =>
		isFunction(cases[TYPE_OK])
			? cases[TYPE_OK](value)
			: Ok(value) as unknown as Result<U, F>,
	get: () => value,
})

/**
 * Create a "Nil" value, representing a lack of a value
 * 
 * @since 0.9.0
 * @returns {Nil} - "Nil" value
 */
const Nil = (): Nil => ({
	[Symbol.toStringTag]: TYPE_NIL,
	map: Nil,
	chain: Nil,
	filter: Nil,
	guard: Nil,
	or: <T>(fn: () => T) => ensure(fn()),
	catch: Nil,
	match: <U, F extends Error>(cases: Cases<undefined, Error, U, F>) =>
		isFunction(cases[TYPE_NIL])
			? cases[TYPE_NIL]()
			: Nil(),
	get: () => undefined,
})

/**
 * Create a "Err" value, representing a failure
 * 
 * @since 0.9.0
 * @param {E} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
const Err = <E extends Error>(error: E): Err<E> => ({
	[Symbol.toStringTag]: TYPE_ERR,
	error,
	map: () => Err<E>(error),
	chain: () => Err<E>(error),
	filter: Nil,
	guard: Nil,
	or: <T>(fn: () => T) => ensure(fn()),
	catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => fn(error),
	match: <U, F extends Error>(cases: Cases<undefined, E, U, F>) =>
		isFunction(cases[TYPE_ERR])
			? cases[TYPE_ERR](error)
			: wrapErr<F>(error),
	get: () => { throw error }, // re-throw error for the caller to handle
})

/**
 * Create an option for a given value to gracefully handle nullable values
 * 
 * @since 0.9.0
 * @param {T | Maybe<T> | null | undefined} value - value to wrap in an array
 * @returns {Maybe<T>} - option of either Ok or Nil, depending on whether the input is nullish
 */
const ensure = <T>(value: T | Maybe<T> | null | undefined): Maybe<T> =>
	!isDefined(value) ? Nil() : isMaybe(value) ? value : Ok(value)

/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 * 
 * @since 0.9.0
 * @param {() => T | Result<T>} fn - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
const attempt = <T, E extends Error>(fn: () => T | Result<T, E>): Result<T, E> => {
	try {
		const result = fn()
		return errOrEnsure(result)
    } catch (error) {
        return wrapErr<E>(error)
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
    const attemptTask = async (retries: number, delay: number): Promise<Result<T, E>> => {
        return Promise.resolve(fn())
            .then((result) => errOrEnsure<T, E>(result))
            .catch(async (error) => {
                if (retries < 1) return wrapErr<E>(error)
                await new Promise(res => setTimeout(res, delay)) // wait for the delay
                return attemptTask(retries - 1, delay * 2) // retry with exponential backoff
            })
    }
    return await attemptTask(retries, delay)
}

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T, E>), ...((input: Result<T, E>) => AsyncResult<T, E>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
async function flow<T, E extends Error>(
	...fns: [T | (() => AsyncResult<T, E>), ...((input: Result<T, E>) => AsyncResult<T, E>)[]]
): Promise<Result<any, any>> {
    let result: any = isFunction(fns[0]) ? Nil() : ensure(fns.shift())
    for (const fn of fns) {
		if (isErr(result)) break
		if (!isFunction(fn)) return Err(new TypeError('Expected a function in flow'))
		result = await gather(() => fn(result))
    }
    return result
}

export {
	type Maybe, type Result, type AsyncResult, type Cases,
	isDefined, isDefinedObject, isObjectOfType, isFunction,
	isOk, isNil, isErr, isMaybe, isResult,
	Ok, Nil, Err, ensure, attempt, gather, flow
}
