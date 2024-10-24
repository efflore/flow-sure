# Result Monads

Version 0.9.2

A Result monad in TypeScript.

Use `option()` to handle maybe nullish values, `result()` to handle possible errors, and `task()` for asynchronous tasks with retry.

The data types Ok, Nil, and Err all implement methods like `map()`, `chain()`, `filter()`, `guard()`, `or()`, `catch()`, `match()`, and `get()`.
