/* === Types === */

type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok'
    value: T
    map: <U>(fn: (value: T) => U) => Result<U, Error>
    flatMap: <U, F extends Error>(fn: (value: T) => Result<U, F>) => Result<U, F>
    filter: (fn: (value: T) => boolean) => Option<T>
    guard: <U extends T>(fn: (value: T) => value is U) => Option<U>
    or: <U>(_: U) => Ok<U>
	catch: <U, F extends Error>(_: (error: undefined) => Result<U, F>) => Ok<T>
	match: <U, F extends Error>(cases: Cases<T, Error, U, F>) => Result<U, F>
    get: () => T
}

type Nil = {
    readonly [Symbol.toStringTag]: 'Nil'
    map: <U>(_: (value: undefined) => U) => Nil
    flatMap: <U, F extends Error>(_: (value: undefined) => Result<U, F>) => Nil
    filter: (_: (value: undefined) => false) => Nil
    guard: <U extends undefined>(_: (value: undefined) => value is U) => Nil
    or: <U>(value: U) => Option<U>
	catch: <U, F extends Error>(_: (error: undefined) => Result<U, F>) => Nil
	match: <U, F extends Error>(cases: Cases<undefined, Error, U, F>) => Result<U, F>
    get: () => undefined
}

type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err'
    error: E
    map: <U, F extends Error>(_: (value: undefined) => U) => Err<F>
	flatMap: <U, F extends Error>(_: (value: undefined) => Result<U, F>) => Err<F>
    filter: (_: (value: undefined) => false) => Nil
    guard: <U extends undefined>(_: (value: undefined) => value is U) => Nil
    or: <U>(value: U) => Option<U>
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

const isOk = <T, E extends Error>(result: Result<T, E>): result is Ok<T> =>
	result[Symbol.toStringTag] === TYPE_OK;
const isErr = <T, E extends Error>(result: Result<T, E>): result is Err<E> =>
	result[Symbol.toStringTag] === TYPE_ERR;
const isNil = <T, E extends Error>(result: Result<T, E>): result is Nil =>
	result[Symbol.toStringTag] === TYPE_NIL;
const isResult = <T, E extends Error>(result: Result<T, E>): result is Ok<T> & Nil & Err<E>  =>
    [TYPE_OK, TYPE_NIL, TYPE_ERR].includes(result[Symbol.toStringTag])

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
	map: <U>(fn: (value: T) => U) => result(() => fn(value)),
	flatMap: <U, F extends Error>(fn: (value: T) => Result<U, F>) => fn(value),
	filter: (fn: (value: T) => boolean) => fn(value) ? Ok<T>(value) : Nil(),
	guard: <U extends T>(fn: (value: T) => value is U) => fn(value) ? Ok<U>(value) : Nil(),
	or: <U>() => Ok(value as unknown as U),
	catch: <U>() => Ok<U>(value as unknown as U),
	match: <U, F extends Error>(cases: Cases<T, Error, U, F>) =>
		isFunction(cases[TYPE_OK])
			? cases[TYPE_OK](value)
			: Ok(value as unknown as U),
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
	flatMap: Nil,
	filter: Nil,
	guard: Nil,
	or: <U>(value: U) => option<U>(value),
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
	map: <F extends Error>() => Err<F>(error as unknown as F),
	flatMap: <F extends Error>() => Err<F>(error as unknown as F),
	filter: Nil,
	guard: Nil,
	or: <U>(value: U) => option<U>(value),
	catch: <U, F extends Error>(fn: (error: E) => Result<U, F>) => fn(error),
	match: <U, F extends Error>(cases: Cases<undefined, E, U, F>) =>
		isFunction(cases[TYPE_ERR])
			? cases[TYPE_ERR](error)
			: Err(error as unknown as F),
	get: () => { throw error }, // re-throw error for the caller to handle
})

/**
 * Create an option for a given value to gracefully handle nullable values
 * 
 * @since 0.9.0
 * @param {T | null | undefined} value - value to wrap in an array
 * @returns {Option<T>} - option of either Ok or Nil, depending on whether the input is nullish
 */
const option = <T>(value: T | null | undefined): Option<T> =>
	isDefined(value) ? Ok<T>(value) : Nil()

/**
 * Try executing the given function and returning a "Ok" value if it succeeds, or a "Err" value if it fails
 * 
 * @since 0.9.0
 * @param {() => T} f - function to try
 * @returns {Result<T, E>} - "Ok" value if the function succeeds, or a "Err" value if it fails
 */
const result = <T, E extends Error>(f: () => T): Result<T, E> => {
	try {
		return option(f())
    } catch (error) {
        return Err(error as E)
    }
}

/**
 * Create an async task that retries the given function with exponential backoff if it fails
 * 
 * @since 0.9.0
 * @param {() => Promise<T>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<T>} - promise that resolves to the result of the function or fails with the last error encountered
 */
const task = async <T, E extends Error>(
    fn: () => Promise<T>,
    retries: number = 0,
    delay: number = 1000
): Promise<Result<T, E>> => {
    const attemptTask = async (retries: number, delay: number): Promise<Result<T, E>> => {
        return fn()
            .then(result => option<T>(result))
            .catch(async (error: unknown) => {
                if (retries < 1) return Err(error as E)
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
 * @param {((v: unknown) => unknown)[]} fs 
 * @returns 
 */
const flow = (...fs: unknown[]) => fs.reduce((acc, f) => callFunction(f, acc))

export {
	TYPE_OK, TYPE_NIL, TYPE_ERR,
	isDefined, isOk, isNil, isErr, isResult, isFunction, callFunction,
	Ok, Nil, Err, option, result, task, flow
}
