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
        expect(result.map(x => x && x + 1).get()).toBeUndefined(); // Nil should remain Nil
    });
})