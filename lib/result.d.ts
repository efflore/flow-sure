import { Ok } from "./ok";
import { Nil } from "./nil";
import { Err } from "./err";
export type Result<T> = Ok<T> | Nil | Err<Error>;
export type MaybeResult<T> = T | Result<T> | undefined;
export type AsyncResult<T> = Promise<MaybeResult<T>>;
/**
 * Wrap a value in a Result container if it is not already a Result type
 *
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a Result or value
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the value
 */
export declare const of: <T>(value: MaybeResult<T>) => Result<T>;
/**
 * Create a Result from a function that may throw an error
 *
 * @since 0.9.6
 * @param {() => MaybeResult<T>} fn - a function that may throw an error
 * @returns {Result<T>} - an Ok<T>, Nil or Err<Error> containing the result of the function
 */
export declare const from: <T>(fn: () => MaybeResult<T>) => Result<T>;
/**
 * Create an async task to gather a resouce; retries the given function with exponential backoff if it fails
 *
 * @since 0.9.6
 * @param {() => AsyncResult<T>} fn - async function to try and maybe retry
 * @param {number} [retries=0] - number of times to retry the function if it fails; default is 0 (no retries)
 * @param {number} [delay=1000] - initial delay in milliseconds between retries; default is 1000ms
 * @returns {Promise<Result<T>>} - promise that resolves to the result of the function or fails with the last error encountered
 */
export declare const fromAsync: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<Result<T>>;
/**
 * Check if a value is a Result type
 *
 * @since 0.9.6
 * @param {unknown} value - the value to check
 * @returns {boolean} - true if the value is a Result type, false otherwise
 */
export declare const isResult: (value: unknown) => value is Result<unknown>;
/**
 * Unwrap a Result container, returning the value if it is Ok, or the error if it is Err
 *
 * @since 0.9.6
 * @param {MaybeResult<T>} value - a value or Result
 * @returns {T | Error | undefined} - the value or error from the Result
 */
export declare const unwrap: <T>(value: Result<T> | T | undefined) => T | Error | undefined;
