type Cases<T, Error> = {
    Ok?: (value: T) => any;
    Nil?: () => any;
    Err?: (error: Error) => any;
    Gone?: () => any;
};
declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
declare const isAsyncFunction: (value: unknown) => value is (...args: any[]) => Promise<any> | PromiseLike<any>;
declare const isDefined: (value: unknown) => value is NonNullable<typeof value>;
declare const isMutable: (value: unknown) => value is Record<PropertyKey, unknown>;
declare const isInstanceOf: <T>(type: new (...args: any[]) => T) => (value: unknown) => value is T;
declare const isError: (value: unknown) => value is Error;
declare const log: (msg: string, logger?: (...args: any[]) => void) => (...args: any[]) => any;
declare const tryClone: <T>(value: T, warn?: boolean) => T;
export { type Cases, isFunction, isAsyncFunction, isDefined, isMutable, isInstanceOf, isError, tryClone, log, };
