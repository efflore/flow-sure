/* === Types === */

type Cases<T, E extends Error> = {
	Ok?: (value: T) => any
	Nil?: () => any
	Err?: (error: E) => any
	// default?: (value: T) => any
}

/* === Utility Functions === */

const isFunction = (value: unknown): value is (...args: any[]) => any =>
    typeof value === 'function'

const isAsyncFunction = (value: unknown): value is (...args: any[]) => Promise<any> | PromiseLike<any> =>
	isFunction(value) && /^async\s+/.test(value.toString())

const isDefined = (value: unknown): value is NonNullable<typeof value> =>
    value != null

const isInstanceOf = <T>(type: new (...args: any[]) => T) =>
	(value: unknown): value is T =>
		value instanceof type

const isError = (value: unknown): value is Error =>
	isInstanceOf(Error)(value)

const noOp = function<T>(this: T) { return this }

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

export { type Cases, isFunction, isAsyncFunction, isDefined, isInstanceOf, isError, noOp }