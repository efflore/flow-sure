# FlowSure

Version 0.9.8

**FlowSure** is a lightweight, functional library designed to handle asynchronous operations and error-prone logic in JavaScript and TypeScript with ease. Inspired by functional programming, it provides `Result` monads (`Ok`, `Err`, `Nil`) to elegantly manage both synchronous and asynchronous workflows, converting complex error handling into expressive, chainable flows.

## Key Features

* **Compositional Error Handling**: Capture, handle, and propagate errors without cluttering your code.
* **Monadic Chains for Flow Control**: Seamlessly compose sync and async functions with `Ok`, `Err`, and `Nil` monads.
* **Functional Flow Composition**: Construct robust, declarative flows with `flow()`, using Result types to maintain clean, predictable control paths.

## Installation

```bash
# with npm
npm install @efflore/flow-sure

# or with bun
bun add @efflore/flow-sure
```

## Basic Usage

### Monadic Control with Result Types

FlowSure's `Result` types (`Ok`, `Err`, `Nil`) let you manage value transformations and error handling with `.map()`, `.chain()`, `.filter()`, `.guard()`, `.or()` and `.catch()` methods. The `match()` method allows for pattern matching according to the `Result`type. Finally, `get()` will return the value (if `Ok`) or `undefined` (if `Nil`) or rethow the catched `Error` (if `Err`).

```js
import { ok } from "@efflore/flow-sure";

ok(5).map(x => x * 2).filter(x => x > 5).match({
    Ok: value => console.log("Transformed Value:", value),
    Nil: () => console.warn("Value didn't meet filter criteria"),
    Err: error => console.error("Error:", error.message)
});
```

#### Monadic Methods Table

| Method      | `Ok<T>`       | `Nil`               | `Err<E extends Error>` | Argument Type                                           | Return Type                |
|-------------|---------------|---------------------|------------------------|---------------------------------------------------------|----------------------------|
| `.map()`    | **Yes**       | No-op               | No-op                  | `(value: T) => U`                                       | `Ok<U>`, `Nil` or `Err<E>` |
| `.chain()`  | **Yes**       | No-op               | No-op                  | `(value: T) => Result<U, Error>`                        | `Result<U, Error>`         |
| `.filter()` | **Yes**       | No-op               | Converts to `Nil`      | `(value: T) => boolean`                                 | `Maybe<T>`                 |
| `.guard()`  | **Yes**       | No-op               | Converts to `Nil`      | `(value: T) => value is U`                              | `Maybe<T>`                 |
| `.or()`     | No-op         | **Yes**             | **Yes**                | `() => T \| undefined`                                  | `Ok<T>` or `Maybe<T>`      |
| `.catch()`  | No-op         | No-op               | **Yes**                | `(error: E) => Result<T, Error>`                        | `Result<T, Error>`         |
| `.match()`  | **Yes**       | **Yes**             | **Yes**                | `(value: T) => any`, `() => any` or `(error: E) => any` | `any`                      |
| `.get()`    | Returns value | Returns `undefined` | Throws error           |  --                                                     | `T`, `undefined` or `E`    |

#### Explanation of Each Method

* `.map()`: Transforms the value if it exists (`Ok`); `Nil` and `Err` remain unchanged.
* `.chain()`: Chains a function that returns a new `Result`, only applies to `Ok`.
* `.filter()`: Filters `Ok` based on a condition; converts to `Nil` if the condition is not met.
* `.guard()`: Similar to `.filter()`, but specifically used for type narrowing on `Ok`.
* `.or()`: Provides a fallback for `Nil` and `Err`, leaving `Ok` unchanged.
* `.catch()`: Handles errors within `Err` types, leaving `Ok` and `Nil` unchanged.
* `.match()`: Allows pattern matching across `Ok`, `Nil`, and `Err`.
* `.get()`: Retrieves the contained value, returning `undefined` for `Nil` and throwing for `Err`.

### Handling Optional or Missing Values with maybe()

Use `maybe()` to wrap values that might be missing (`undefined` or `null`) and convert them into `Ok` or `Nil`. This is particularly useful for safely working with values that may or may not be present.

```js
import { maybe } from "@efflore/flow-sure";

const optionalValue = undefined; // Could also be null or an actual value
maybe(optionalValue)
    .map(value => value * 2)
    .filter(value => value > 5)
    .match({
        Ok: value => console.log("Value:", value),
        Nil: () => console.warn("Value is either missing or didn't meet criteria")
    });
```

### Handling Exceptions with result()

`result()` is used to safely execute functions that may throw exceptions. It captures exceptions and converts them into `Err` values, allowing you to handle errors gracefully within the chain.

```js
import { result } from "@efflore/flow-sure";

result(() => {
    // Function that may throw an error
    return JSON.parse("invalid json");
}).match({
    Ok: value => console.log("Parsed JSON:", value),
    Err: error => console.error("Failed to parse JSON:", error.message)
});
```

### Handling Promises with asyncResult()

Use `asyncResult()` to retrieve and handle a promised result, wrapping it in `Result` types (`Ok`, `Err`, `Nil`). Here's an example of how you can add retry logic for async operations:

```ts
import { asyncResult, err } from "@efflore/flow-sure";

const fetchData = async () => {
    const response = await fetch('/api/data');
    if (!response.ok) return err(`Failed to fetch data: ${response.statusText}`);
    return response.json();
}

const retry = <T>(
    fn: () => Promise<MaybeResult<T>>,
    retries: number,
    delay: number
) => asyncResult(fn)
        .catch((error: Error) => {
            if (retries <= 0) return err(error);
            return new Promise(resolve => setTimeout(resolve, delay))
                .then(() => retry(fn, retries - 1, delay * 2));
        });

// 3 attempts, exponential backoff with initial 1000ms delay
const loadData = async () {
	const data = await retry(fetchData, 3, 1000);
	// Process data ...
}
```

### Using flow() for Declarative Control

`flow()` enables you to compose a series of functions (both sync and async) into a cohesive pipeline:

```js
import { flow } from "@efflore/flow-sure";

const processData = async () {
	const result = await flow(
		10,
		x => x * 2,
		async x => await someAsyncOperation(x)
	).match({
		Ok: finalValue => console.log("Result:", finalValue),
		Err: error => console.error("Error:", error.message)
	});
	// Render data ...
}
```
