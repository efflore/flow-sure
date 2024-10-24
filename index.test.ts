import { describe, test, expect } from "bun:test";
import { Ok, Nil, Err } from "./index";

// Test for Ok result
describe("Result Monad", () => {
    test("should return Ok for a successful value", () => {
        const result = Ok(42);
        expect(result.get()).toBe(42);
        expect(result.map(x => x + 1).get()).toBe(43);
    });

    // Test for Err result
    test("should handle errors correctly", () => {
        const error = new Error("Something went wrong");
        const result = Err(error);
        expect(result.get).toThrowError("Something went wrong");
        expect(result.match({
            Err: (err) => err.message === "Something went wrong" ? Ok(42) : Nil(),
            Ok: () => Nil()
        }).get()).toBe(42);
    });

    // Test for Nil result
    test("should handle Nil correctly", () => {
        const result = Nil();
        expect(result.get()).toBeUndefined();
        expect(result.map(x => x + 1).get()).toBeUndefined(); // Nil should remain Nil
    });
});

// Helper functions for testing
const identity = <T>(x: T): T => x;
const addOne = (x: number) => x + 1;
const addOneOk = (x: number) => Ok(x + 1);
const double = (x: number) => x * 2;
const doubleOk = (x: number) => Ok(x * 2);

// Test Monad Laws for Ok
describe("Monad Laws for Ok", () => {
    test("Left Identity: Ok(x).chain(f) === f(x)", () => {
        const x = 5;
        const f = addOneOk;
        const result1 = Ok(x).chain(f);
        const result2 = f(x);
        expect(result1.get()).toBe(result2.get());
    });

    test("Right Identity: Ok(x).chain(Ok) === Ok(x)", () => {
        const x = 5;
        const result1 = Ok(x).chain(Ok);
        const result2 = Ok(x);
        expect(result1.get()).toBe(result2.get());
    });

    test("Associativity: (Ok(x).chain(f)).chain(g) === Ok(x).chain(x => f(x).chain(g))", () => {
        const x = 5;
        const f = addOneOk;
        const g = doubleOk;
        const result1 = Ok(x).chain(f).chain(g);
        const result2 = Ok(x).chain(x => f(x).chain(g));
        expect(result1.get()).toBe(result2.get());
    });
});

// Test Monad Laws for Err
describe("Monad Laws for Err", () => {
    test("Left Identity: Err.chain(f) === Err", () => {
        const err = Err(new Error("Error"));
        const f = addOneOk;
        const result = err.chain(f);
        expect(result.error).toBe(err.error);
    });

    test("Right Identity: Err.chain(Ok) === Err", () => {
        const err = Err(new Error("Error"));
        const result = err.chain(Ok);
        expect(result.error).toBe(err.error);
    });

    test("Associativity: (Err.chain(f)).chain(g) === Err.chain(x => f(x).chain(g))", () => {
        const err = Err(new Error("Error"));
        const f = addOneOk;
        const g = doubleOk;
        const result1 = err.chain(f).chain(g);
        const result2 = err.chain(x => f(x).chain(g));
        expect(result1.error).toBe(err.error);
        expect(result2.error).toBe(err.error);
    });
});

// Test Monad Laws for Nil
describe("Monad Laws for Nil", () => {
    test("Left Identity: Nil.chain(f) === Nil", () => {
        const f = addOneOk;
        const result = Nil().chain(f);
        expect(result.get()).toBe(Nil().get());
    });

    test("Right Identity: Nil.chain(Ok) === Nil", () => {
        const result = Nil().chain(Ok);
        expect(result.get()).toBe(Nil().get());
    });

    test("Associativity: (Nil.chain(f)).chain(g) === Nil.chain(x => f(x).chain(g))", () => {
        const f = addOneOk;
        const g = doubleOk;
        const result1 = Nil().chain(f).chain(g);
        const result2 = Nil().chain(x => f(x).chain(g));
        expect(result1.get()).toBe(Nil().get());
        expect(result2.get()).toBe(Nil().get());
    });
});

// Test Functor Laws for Ok
describe("Functor Laws for Ok", () => {
    test("Identity: Ok(x).map(x => x) === Ok(x)", () => {
        const x = 5;
        const result1 = Ok(x).map(identity);
        const result2 = Ok(x);
        expect(result1.get()).toBe(result2.get());
    });

    test("Composition: Ok(x).map(x => f(g(x))) === Ok(x).map(g).map(f)", () => {
        const x = 5;
        const result1 = Ok(x).map(x => addOne(double(x))); // map with composition
        const result2 = Ok(x).map(double).map(addOne); // map separately
        expect(result1.get()).toBe(result2.get());
    });
});

// Test Functor Laws for Err
describe("Functor Laws for Err", () => {
    test("Identity: Err.map(x => x) === Err", () => {
        const err = Err(new Error("Error"));
        const result = err.map(identity);
        expect(result.error).toBe(err.error);
    });

    test("Composition: Err.map(x => f(g(x))) === Err.map(g).map(f)", () => {
        const err = Err(new Error("Error"));
        const result1 = err.map(x => addOne(double(x))); // map with composition
        const result2 = err.map(double).map(addOne); // map separately
        expect(result1.error).toBe(err.error); // No transformation happens on Err
        expect(result2.error).toBe(err.error); // No transformation happens on Err
    });
});

// Test Functor Laws for Nil
describe("Functor Laws for Nil", () => {
    test("Identity: Nil.map(x => x) === Nil", () => {
        const result = Nil().map(identity);
        expect(result.get()).toBe(Nil().get());
    });

    test("Composition: Nil.map(x => f(g(x))) === Nil.map(g).map(f)", () => {
        const result1 = Nil().map(x => addOne(double(x))); // map with composition
        const result2 = Nil().map(double).map(addOne); // map separately
        expect(result1.get()).toBe(Nil().get()); // No transformation happens on Nil
        expect(result2.get()).toBe(Nil().get()); // No transformation happens on Nil
    });
});