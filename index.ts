/* === Types === */

type ResultType = 'Ok' | 'Nil' | 'Err'

type Nil = {
    readonly [Symbol.toStringTag]: 'Nil'
    map: () => Nil
    flatMap: () => Nil
    filter: () => Nil
    guard: () => Nil
    or: <T>(value: T) => Option<T>
	catch: () => Nil
	match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>
    get: () => void
}

type Ok<T> = {
    readonly [Symbol.toStringTag]: 'Ok'
    value: T
    map: <U, E extends Error>(fn: (value: T) => U) => Result<U, E>
    flatMap: <U, E extends Error>(fn: (value: T) => Result<U, E>) => Result<U, E>
    filter: (fn: (value: T) => boolean) => Option<T>
    guard: <U extends T>(fn: (value: T) => value is U) => Option<U>
    or: () => Ok<T>
	catch: () => Ok<T>
	match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>
    get: () => T
}

type Err<E extends Error> = {
    readonly [Symbol.toStringTag]: 'Err'
    error: E
    map: () => Err<E>
    flatMap: () => Err<E>
    filter: () => Err<E>
    guard: () => Err<E>
    or: <T>(value: T) => Option<T>
	catch: <T, F extends Error>(fn: (error: E) => Result<T, F>) => Result<T, F>
	match: <T, E extends Error>(cases: Cases<T, E>) => Result<T, E>
    get: () => never
}

type Option<T> = Ok<T> | Nil

type Result<T, E extends Error> = Ok<T> | Nil | Err<E>

type Cases<T, E extends Error> = {
    [TYPE_OK]?: (value: unknown) => Result<T, E>
    [TYPE_NIL]?: () => Result<T, E>
    [TYPE_ERR]?: (error: unknown) => Result<T, E>
    else?: (value: unknown) => Result<T, E>
};

/* === Constants === */

const TYPE_OK = 'Ok'
const TYPE_NIL = 'Nil'
const TYPE_ERR = 'Err'

/* === Utility Functions === */

const isDefined = (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isObjectOfType = <T>(type: string) => (value: unknown): value is {} & {
    [Symbol.toStringTag]: T
} =>
    isDefined(value) && (Symbol.toStringTag in value) && value[Symbol.toStringTag] === type

const isOk = isObjectOfType(TYPE_OK)
const isNil = isObjectOfType(TYPE_NIL)
const isErr = isObjectOfType(TYPE_ERR)

const isResult = <T, E extends Error>(value: unknown): value is Ok<T> | Err<E> | Nil =>
    isOk(value) || isNil(value) || isErr(value)

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const isFunction: (value: unknown) => value is Function = (value: unknown) =>
    typeof value === 'function'

const callFunction = (fn: unknown, ...args: unknown[]): unknown =>
    isFunction(fn) ? fn(...args) : undefined

const matchCase = (type: ResultType, value: unknown, id: unknown) =>
	<T, E extends Error>(cases: Cases<T, E>): Result<T, E> => {
		const fn = cases[type] ?? cases.else
		return isFunction(fn) ? fn(value) : id as Result<T, E>
	}

/* === Exported Functions === */

/**
 * Create an "Ok" value, representing a value
 * 
 * @since 0.9.0
 * @param {T} value - value to wrap in an "Ok" value
 * @returns {Ok<T>} - "Ok" value with the given value
 */
const Ok = <T>(value: T): Ok<T> => ({
	[Symbol.toStringTag]: TYPE_OK,
	value,
	map: <U>(fn: (value: T) => U): Option<U> => option(fn(value)),
	flatMap: <U, E extends Error>(fn: (value: T) => Result<U, E>): Result<U, E> => fn(value),
	filter: (fn: (value: T) => boolean): Option<T> => fn(value) ? Ok(value) : Nil(),
	guard: <U extends T>(fn: (value: T) => value is U) => fn(value) ? Ok(value) : Nil(),
	or: () => Ok(value),
	catch: () => Ok(value),
	match: matchCase(TYPE_OK, value, Ok(value)),
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
	or: option,
	catch: Nil,
	match: matchCase(TYPE_NIL, undefined, Nil()),
	get: () => undefined,
})

/**
 * Create a "Err" value, representing a failure
 * 
 * @since 0.9.0
 * @param {E extends Error} error - error to wrap in a "Err" value
 * @returns {Err<E>} - "Err" value with the given error
 */
const Err = <E extends Error>(error: E): Err<E> => ({
	[Symbol.toStringTag]: TYPE_ERR,
	error,
	map: () => Err(error),
	flatMap: () => Err(error),
	filter: () => Err(error),
	guard: () => Err(error),
	or: <T>(value: T): Option<T> => option(value),
	catch: <T, F extends Error>(fn: (error: E) => Result<T, F>): Result<T, F> => fn(error),
	match: matchCase(TYPE_ERR, error, Err(error)),
	get: () => { throw error }, // re-throw error for the caller to handle
})

/**
 * Create an array for a given value to gracefully handle nullable values
 * 
 * @since 0.9.0
 * @param {T | null | undefined} value - value to wrap in an array
 * @returns {T[]} - array of either zero or one element, depending on whether the input is nullish
 */
const option = <T>(value: T | null | undefined): Option<T> =>
	isDefined(value) ? Ok(value) : Nil()

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
            .then(result => option(result))
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
	isDefined, isObjectOfType, isOk, isNil, isErr, isResult, isFunction, callFunction,
	Ok, Nil, Err, option, result, task, flow
}
