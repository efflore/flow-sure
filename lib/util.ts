/* === Types === */

type Cases<T, Error> = {
	Ok?: (value: T) => any
	Nil?: () => any
	Err?: (error: Error) => any
	Gone?: () => any
	// default?: (value: T) => any
}

/* === Utility Functions === */

const isFunction = /*#__PURE__*/ (value: unknown): value is (...args: any[]) => any =>
    typeof value === 'function'

const isAsyncFunction = /*#__PURE__*/ (value: unknown): value is (...args: any[]) => Promise<any> | PromiseLike<any> =>
	isFunction(value) &&
		(value.constructor.name === "AsyncFunction" || /^\s*async\s+/.test(value.toString()))

const isDefined = /*#__PURE__*/ (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isMutable = /*#__PURE__*/ (value: unknown): value is Record<PropertyKey, unknown> =>
	(typeof value === 'object' && value!== null)

const isInstanceOf = /*#__PURE__*/ <T>(type: new (...args: any[]) => T) =>
	(value: unknown): value is T =>
		value instanceof type

const isError = isInstanceOf(Error)

const log = (msg: string, logger: (...args: any[]) => void = console.log) =>
	(...args: any[]) => {
        logger(msg, ...args)
		return args[0]
	}

const tryClone = /*#__PURE__*/ <T>(value: T, warn = true): T => {
    if (!isMutable(value)) return value
    try {
        return structuredClone(value)
    } catch {
		if (warn) log('Failed to clone value:', console.warn)(value)
        return value
    }
}

export {
	type Cases,
	isFunction, isAsyncFunction, isDefined, isMutable,
	isInstanceOf, isError, log, tryClone
}