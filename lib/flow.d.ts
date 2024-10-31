import { type AsyncResult, type MaybeResult, type Result } from "./result";
/**
 * Helper function to execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<any, any>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
export declare const flow: <T>(fns_0: T | (() => MaybeResult<T> | AsyncResult<T>), ...fns: ((input: T) => MaybeResult<T> | AsyncResult<T>)[]) => Promise<Result<any>>;
