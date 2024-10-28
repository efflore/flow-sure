# FlowSure

Version 0.9.5

**FlowSure** is a lightweight, functional library designed to handle asynchronous operations and error-prone logic in JavaScript and TypeScript with ease. Inspired by functional programming, it provides `Result` monads (`Ok`, `Err`, `Nil`) to elegantly manage both synchronous and asynchronous workflows, converting complex error handling into expressive, chainable flows.

## Key Features

* **Compositional Error Handling**: Capture, handle, and propagate errors without cluttering your code.
* **Monadic Chains for Flow Control**: Seamlessly compose sync and async functions with `Ok`, `Err`, and `Nil` monads.
* **Functional Flow Composition**: Construct robust, declarative flows with `flow()`, using Result types to maintain clean, predictable control paths.
* **Optional Async Retry Logic**: Use `gather()` to handle promises and add retry logic with exponential backoff if needed.

## Installation

```bash
# with npm
npm install @efflore/flow-sure

# or with yarn
yarn add @efflore/flow-sure
```

## Basic Usage

### Monadic Control with Result Types

FlowSure's `Result` types (`Ok`, `Err`, `Nil`) let you manage value transformations and error handling with `.map()`, `.chain()`, `.filter()`, `.guard()`, `.or()` and `.catch()` methods. The `match()` method allows for pattern matching according to the `Result`type. Finally, `get()` will return the value (if `Ok`) or `undefined` (if `Nil`) or rethow the catched `Error` (if `Err`).

```js
import { Ok } from "@efflore/flow-sure";

const result = Ok(5).map(x => x * 2).filter(x => x > 5);
result.match({
    Ok: value => console.log("Transformed Value:", value),
    Nil: () => console.warn("Value didn't meet filter criteria"),
    Err: error => console.error("Error:", error.message)
});
```

### Handling Optional or Missing Values with ensure()

Use `ensure()` to wrap values that might be missing (`undefined` or `null`) and convert them into `Ok` or `Nil`. This is particularly useful for safely working with values that may or may not be present.

```js
import { ensure } from "@efflore/flow-sure";

const optionalValue = undefined; // Could also be null or an actual value
const result = ensure(optionalValue)
    .map(value => value * 2)
    .filter(value => value > 5)
    .match({
        Ok: value => console.log("Value:", value),
        Nil: () => console.warn("Value is either missing or didn't meet criteria")
    });
```

### Handling Exceptions with attempt()

`attempt()` is used to safely execute functions that may throw exceptions. It captures exceptions and converts them into `Err` values, allowing you to handle errors gracefully within the chain.

```js
import { attempt } from "@efflore/flow-sure";

const result = attempt(() => {
    // Function that may throw an error
    return JSON.parse("invalid json");
}).match({
    Ok: value => console.log("Parsed JSON:", value),
    Err: error => console.error("Failed to parse JSON:", error.message)
});
```

### Handling Promises with gather()

Use `gather()` to retrieve and handle a promised result, wrapping it in `Result` types (`Ok`, `Err`, `Nil`). You can also add retry logic for async operations:

```js
import { gather, Err } from "@efflore/flow-sure";

async function fetchData() {
    return await gather(
        () => fetch('/api/data').then(res => res.json()),
        3, // 3 retries
        1000 // 1 second initial delay, exponential backoff
    ).match({
        Nil: () => Err(new Error("No data found"))
    });
}
```

### Using flow() for Declarative Control

`flow()` enables you to compose a series of functions (both sync and async) into a cohesive pipeline:

```js
import { flow } from "@efflore/flow-sure";

const result = await flow(
    10,
    x => x * 2,
    async x => await someAsyncOperation(x)
).match({
    Ok: finalValue => console.log("Result:", finalValue),
    Err: error => console.error("Error:", error.message)
});
```
