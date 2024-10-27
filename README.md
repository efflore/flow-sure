# FlowSure

Version 0.9.4

A Result monad in TypeScript.

Use `ensure()` to handle maybe nullish values, `attempt()` to handle possible errors, and `gather()` for asynchronous tasks with retry. Use `flow()` to compose nested functions sequentially.

The data types `Ok<T>`, `Nil`, and `Err<E extends Error>` all implement methods like `map()`, `chain()`, `filter()`, `guard()`, `or()`, `catch()`, `match()`, and `get()`.
