import { describe, test, expect } from "bun:test";
import { Ok, Nil, Err, isOk } from "./index";

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
    test("Left Identity: Ok(x).flatMap(f) === f(x)", () => {
        const x = 5;
        const f = addOneOk;
        const result1 = Ok(x).flatMap(f);
        const result2 = f(x);
        expect(result1.value).toBe(result2.value);
    });

    test("Right Identity: Ok(x).flatMap(Ok) === Ok(x)", () => {
        const x = 5;
        const result1 = Ok(x).flatMap(Ok);
        const result2 = Ok(x);
        expect(result1.value).toBe(result2.value);
    });

    test("Associativity: (Ok(x).flatMap(f)).flatMap(g) === Ok(x).flatMap(x => f(x).flatMap(g))", () => {
        const x = 5;
        const f = addOneOk;
        const g = doubleOk;
        const result1 = Ok(x).flatMap(f).flatMap(g);
        const result2 = Ok(x).flatMap(x => f(x).flatMap(g));
        expect(result1.value).toBe(result2.value);
    });
});

// Test Monad Laws for Err
describe("Monad Laws for Err", () => {
    test("Left Identity: Err.flatMap(f) === Err", () => {
        const err = Err(new Error("Error"));
        const f = addOneOk;
        const result = err.flatMap(f);
        expect(result.error).toBe(err.error);
    });

    test("Right Identity: Err.flatMap(Ok) === Err", () => {
        const err = Err(new Error("Error"));
        const result = err.flatMap(Ok);
        expect(result.error).toBe(err.error);
    });

    test("Associativity: (Err.flatMap(f)).flatMap(g) === Err.flatMap(x => f(x).flatMap(g))", () => {
        const err = Err(new Error("Error"));
        const f = addOneOk;
        const g = doubleOk;
        const result1 = err.flatMap(f).flatMap(g);
        const result2 = err.flatMap(x => f(x).flatMap(g));
        expect(result1.error).toBe(err.error);
        expect(result2.error).toBe(err.error);
    });
});

// Test Monad Laws for Nil
describe("Monad Laws for Nil", () => {
    test("Left Identity: Nil.flatMap(f) === Nil", () => {
        const f = addOneOk;
        const result = Nil().flatMap(f);
        expect(result.get()).toBe(Nil().get());
    });

    test("Right Identity: Nil.flatMap(Ok) === Nil", () => {
        const result = Nil().flatMap(Ok);
        expect(result.get()).toBe(Nil().get());
    });

    test("Associativity: (Nil.flatMap(f)).flatMap(g) === Nil.flatMap(x => f(x).flatMap(g))", () => {
        const f = addOneOk;
        const g = doubleOk;
        const result1 = Nil().flatMap(f).flatMap(g);
        const result2 = Nil().flatMap(x => f(x).flatMap(g));
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
        expect(result1.value).toBe(result2.value);
    });

    test("Composition: Ok(x).map(x => f(g(x))) === Ok(x).map(g).map(f)", () => {
        const x = 5;
        const result1 = Ok(x).map(x => addOne(double(x))); // map with composition
        const result2 = Ok(x).map(double).map(addOne); // map separately
        expect(result1.value).toBe(result2.value);
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