type Cases<T, E extends Error> = {
    Ok?: (value: T) => any;
    Nil?: () => any;
    Err?: (error: E) => any;
};
declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
declare const isAsyncFunction: (value: unknown) => value is (...args: any[]) => Promise<any> | PromiseLike<any>;
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
declare const isInstanceOf: <T>(type: new (...args: any[]) => T) => (value: unknown) => value is T;
declare const noOp: <T>(this: T) => T;
export { type Cases, isFunction, isAsyncFunction, isDefined, isInstanceOf, noOp };
