# FlowSure

Version 0.9.3

A Result monad in TypeScript.

Use `ensure()` to handle maybe nullish values, `attempt()` to handle possible errors, and `obtain()` for asynchronous tasks with retry. Use `flow()` to compose nested functions sequentially.

The data types `Ok<T>`, `Nil`, and `Err<E extends Error>` all implement methods like `map()`, `chain()`, `filter()`, `guard()`, `or()`, `catch()`, `match()`, and `get()`.
