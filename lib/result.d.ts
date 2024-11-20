import { type Ok } from "./ok";
import { type Nil } from "./nil";
import { type Err } from "./err";
type Result<T> = Ok<T> | Nil | Err<Error>;
type MaybeResult<T> = Result<T> | T | Error | null | undefined;
/**
 * Get a Result from a function that may throw an error
 *
 * @since 0.9.6
 * @param {() => MaybeResult<T>} fn - a function that may throw an error
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
 */
declare const result: <T>(fn: (...args: any[]) => MaybeResult<T>, ...args: any[]) => Result<T>;
/**
 * Get an async Result from a function that may throw an error
 *
 * @since 0.9.6
 * @param {() => Promise<MaybeResult<T>>} fn - async function to try and maybe retry
 * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
declare const task: <T>(fn: (...args: any[]) => Promise<MaybeResult<T>>, ...args: any[]) => Promise<Result<T>>;
/**
 * Execute a series of functions in sequence
 *
 * @since 0.9.0
 * @param {[T | (() => AsyncResult<T>), ...((input: T) => AsyncResult<T>)[]]} fns - array of functions to execute in sequence
 * @returns {Promise<Result<R>>} - promise that resolves to the result of the last function or fails with the first error encountered
 */
declare const flow: <T, R>(fns_0: T | (() => MaybeResult<T> | Promise<MaybeResult<T>>), ...fns: ((input: T) => MaybeResult<T> | Promise<MaybeResult<T>>)[]) => Promise<Result<R>>;
/**
 * Check if a value is a Result type
 *
 * @since 0.9.6
 * @param {any} value - the value to check
 * @returns {boolean} - true if the value is a Result type, false otherwise
 */
declare const isResult: (value: any) => value is Result<any>;
/**
 * Wrap a value in a Result container if it is not already a Result type
 *
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a Result or value
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
 */
declare const wrap: <T>(value: MaybeResult<T>) => Result<T>;
/**
 * Unwrap a Result container, returning the value if it is Ok, or the error if it is Err
 *
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a value or Result
 * @returns {T | Error | void} - the value or error from the Result
 */
declare const unwrap: <T>(value: Result<T> | T | void) => T | Error | void;
export { type Result, type MaybeResult, result, task, flow, isResult, wrap, unwrap, };
