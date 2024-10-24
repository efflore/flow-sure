/* === Types === */

type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok'
    value: T
    map: <U>(fn: (value: T) => U) => Ok<U>
    chain: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>
    filter: (fn: (value: T) => boolean) => Option<T>
    guard: <U extends T>(fn: (value: T) => value is U) => Option<U>
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
    or: <T>(value: T) => Option<T>
	catch: (_: any) => Nil
	match: <U, F extends Error>(cases: Cases<undefined, Error, U, F>) => Result<U, F>
    get: () => undefined
}

type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err'
    error: E
    map: (_: any) => Err<E>
	chain: (_: any) => Err<E>
    filter: (_: any) => Nil
    guard: (_: any) => Nil
    or: <T>(value: T) => Option<T>
	catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => Result<U, F>
	match: <U, F extends Error>(cases: Cases<undefined, E, U, F>) => Result<U, F>
    get: () => never
}

type Option<T> = Ok<T> | Nil

type Result<T, E extends Error> = Ok<T> | Nil | Err<E>

type Cases<T, E extends Error, U, F extends Error> = {
    [TYPE_OK]?: (value: T) => Result<U, F>
    [TYPE_NIL]?: () => Result<U, F>
    [TYPE_ERR]?: (error: E) => Result<U, F>
};

/* === Constants === */

const TYPE_OK = 'Ok'
const TYPE_NIL = 'Nil'
const TYPE_ERR = 'Err'

/* === Utility Functions === */

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

const isResult = <T, E extends Error>(value: unknown): value is Ok<T> & Nil & Err<E> =>
	isOk(value) || isNil(value) || isErr(value)

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const isFunction: (value: unknown) => value is Function = (value: unknown) =>
    typeof value === 'function'

const callFunction = (fn: unknown, ...args: unknown[]): unknown =>
    isFunction(fn) ? fn(...args) : undefined

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
	or: <T>(value: T) => ensure(value),
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
	or: <T>(value: T) => ensure(value),
	catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => fn(error),
	match: <U, F extends Error>(cases: Cases<undefined, E, U, F>) =>
		isFunction(cases[TYPE_ERR])
			? cases[TYPE_ERR](error)
			: Err(error) as unknown as Err<F>,
	get: () => { throw error }, // re-throw error for the caller to handle
})

/**
 * Create an option for a given value to gracefully handle nullable values
 * 
 * @since 0.9.0
 * @param {T | null | undefined} value - value to wrap in an array
 * @returns {Option<T>} - option of either Ok or Nil, depending on whether the input is nullish
 */
const ensure = <T>(value: T | null | undefined): Option<T> =>
	isDefined(value) ? Ok<T>(value) : Nil()

/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 * 
 * @since 0.9.0
 * @param {() => T} fn - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
const attempt = <T, E extends Error>(fn: () => T): Result<T, E> => {
	try {
		return ensure(fn())
    } catch (error) {
        return Err(error as E)
    }
}

/**
 * Create an async task to obtain a resouce; retries the given function with exponential backoff if it fails
 * 
 * @since 0.9.0
 * @param {() => Promise<T>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<T>} - promise that resolves to the result of the function or fails with the last error encountered
 */
const obtain = async <T, E extends Error>(
    fn: () => Promise<T>,
    retries: number = 0,
    delay: number = 1000
): Promise<Result<T, E>> => {
    const attemptTask = async (retries: number, delay: number): Promise<Result<T, E>> => {
        return fn()
            .then(result => ensure(result))
            .catch(async (error) => {
                if (retries < 1) return Err(error)
                await new Promise(resolve => setTimeout(resolve, delay)) // wait for the delay
                return attemptTask(retries - 1, delay * 2) // retry with exponential backoff
            });
    }
    return await attemptTask(retries, delay)
}

/**
 * Helper function to execute a series of functions in sequence
 * 
 * @since 0.9.0
 * @param {((v: unknown) => unknown)[]} fns 
 * @returns 
 */
const flow = (...fns: unknown[]) => fns.reduce((acc, fn) => callFunction(fn, acc))

export {
	isDefined, isDefinedObject, isObjectOfType, isFunction, callFunction,
	isOk, isNil, isErr, isResult,
	Ok, Nil, Err, ensure, attempt, obtain, flow
}
