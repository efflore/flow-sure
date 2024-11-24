import { describe, test, expect } from "bun:test";
import {
	type Result, type MaybeResult,
	ok, isOk, isGone, nil, isNil, err, isErr, maybe, result, task, flow
} from "./index";

/* === Types === */

type Rule = [number, string]
type Validation = {
  isValidNumber: (num: number) => boolean
  isValidRule: (rule: Rule) => boolean
  invalidNumberError: string
  invalidRulesError: string
}
type Strategy = (rules: Rule[], num: number) => string

type TreeNode = { id: number; parentId: number; name: string, children?: Set<TreeNode> }
type TreeStructure = { roots: Set<TreeNode>, orphans: Set<TreeNode>}

/* === Utility Functions === */

const identity = <T>(x: T): T => x;
const addOne = (x: number) => x + 1;
const addOneOk = (x: number) => ok(x + 1);
const double = (x: number) => x * 2;
const doubleOk = (x: number) => ok(x * 2);
const half = (x: number) => x / 2;
const isPositive = (x: number) => x > 0;
const isEven = (x: number) => x % 2 === 0;
const isString = (x: unknown): x is string => typeof x === 'string';
const isPositiveNumber = (x: unknown): x is number => typeof x === 'number' && x > 0;
const recoverWithOk = () => ok("recovered");
const recoverWithNil = () => nil();
const recoverWithErr = () => err("Recovery failed");
const handleOk = (value: number) => ok(value + 1);
const handleNil = () => ok("Recovered from Nil");
const handleErr = (error: Error) => ok(`Recovered from error: ${error.message}`);
const handleGone = () => ok("Recovered from Gone");
const successfulTask = () => Promise.resolve(10);
const nullTask = () => Promise.resolve(null);
const failingTask = () => Promise.reject(new Error("Task failed"));

/* === Tests === */

describe("Ok Use Case", () => {

    test("isOk should return true for Ok instances", () => {
        const o = ok(10);
        expect(isOk(o)).toBe(true);
    });

    test("isOk should return false for Nil instances", () => {
        const n = nil();
        expect(isOk(n)).toBe(false);
    });

    test("isOk should return false for Err instances", () => {
        const e = err("Error");
        expect(isOk(e)).toBe(false);
    });

    test("map and filter should apply functions to the value of Ok instances", () => {
        const result = ok(5).map(x => x * 2).filter(x => x > 5);
        expect(isOk(result)).toBe(true);
        expect(result.get()).toBe(10);
        result.match({
            Ok: value => expect(typeof value).toBe('number'),
            Nil: () => expect().toBe(undefined),
            Err: error => expect(error instanceof Error).toBe(true)
        });
    });

	test("Ok clones mutable objects successfully", () => {
		const obj = { a: 1 };
		const instance = ok(obj);
		obj.a = 2; // Modify original object
		expect(instance.get()).toEqual({ a: 1 }); // Clone remains unchanged
	});

	test("Ok falls back for non-cloneable types", async () => {
		const promise = new Promise(resolve => setTimeout(() => resolve(10), 1));
		const instance = ok(promise);
		const res = instance.get();
		expect(res).toBe(promise);
		expect(await res).toBe(await promise);
		expect(() => instance.get()).toThrow("Mutable reference has already been consumed");
	});

	test("Ok treats unsupported types as immutable", () => {
		expect(() => ok(Symbol("test"))).not.toThrow();
		expect(() => ok(() => {})).not.toThrow();
		expect(() => ok(BigInt(42))).not.toThrow();
	});

	test("Ok clones objects with circular references correctly", () => {
		const circular: any = {};
		circular.self = circular;
	
		const instance = ok(circular);
		const cloned = instance.get();
	
		// Verify that the circular reference is preserved
		expect(cloned.self).toBe(cloned);
		expect(cloned).not.toBe(circular); // The clone should not be the same reference as the original
	});
});

describe("Maybe Use Case", () => {
	const isIntegerInRange = (min: number, max?: number) => (n: number) =>
		Number.isInteger(n) && n >= min && max ? n <= max : true
	const isNonEmptyString = (s: string) =>
		typeof s === "string" && s.length > 0

	// Generalized Numeral Converter
	const numeral = (
		strategy: Strategy,
		rules: Rule[],
		validation: Validation
	) => {
		const {
			isValidNumber,
			isValidRule,
			invalidNumberError,
			invalidRulesError
		} = validation
	  
		const transform = (n: number): Result<string> =>
			maybe(rules)
				.filter(Array.isArray)
				.filter(() => rules.every(isValidRule))
				.map((validRules: Rule[]) => strategy(validRules, n))
				.match({
					Nil: () => err(invalidRulesError),
				})
	  
		return (n: number): string =>
			maybe(n)
				.filter(isValidNumber)
				.chain((num: number) => transform(num))
				.match({
					Nil: () => err(invalidNumberError),
				})
				.get()
	}		

	test("FizzBuzz should handle numbers correctly", () => {
		const fizzBuzzStrategy: Strategy = (rules, num) =>
			rules.reduce(
				(acc, [divisor, word]) => (num % divisor === 0 ? acc + word : acc),
				""
			) || String(num)
		const fizzBuzzRules: Rule[] = [
			[3, "Fizz"],
			[5, "Buzz"],
		]
		const fizzBuzzValidation: Validation = {
			isValidNumber: isIntegerInRange(1, 99),
			isValidRule: ([divisor, word]) =>
				isIntegerInRange(1, 9)(divisor) && isNonEmptyString(word),
			invalidNumberError: "Number must be an integer between 1 and 99.",
			invalidRulesError: "Rules must be an array of [integer (1–9), non-empty string] pairs.",
		}
		const fizzBuzz = numeral(fizzBuzzStrategy, fizzBuzzRules, fizzBuzzValidation)

        expect(fizzBuzz(1)).toBe("1");
        expect(fizzBuzz(2)).toBe("2");
        expect(fizzBuzz(3)).toBe("Fizz");
        expect(fizzBuzz(5)).toBe("Buzz");
        expect(fizzBuzz(15)).toBe("FizzBuzz");

		const fizzBuzzRange = (rules: Array<[number, string]>, limit: number) =>
			Array.from({ length: limit }, (_, i) => i + 1)
				.map(numeral(fizzBuzzStrategy, rules, fizzBuzzValidation))
				.join(" ")
		
        expect(fizzBuzzRange([[3, "Fizz"], [5, "Buzz"], [7, "Pop"]], 35))
			.toBe("1 2 Fizz 4 Buzz Fizz Pop 8 Fizz Buzz 11 Fizz 13 Pop FizzBuzz 16 17 Fizz 19 Buzz FizzPop 22 23 Fizz Buzz 26 Fizz Pop 29 FizzBuzz 31 32 Fizz 34 BuzzPop");
    });

	test("Roman Numeral Converter should handle numbers correctly", () => {
		const toRoman = numeral(
			(rules, num) => { // Strategy for Roman Numeral Conversion
				let result = ""
				let remaining = num
				for (const [value, symbol] of rules) {
					while (remaining >= value) {
						result += symbol
						remaining -= value
					}
				}
				return result
			},
			[ // Roman Numeral Rules
				[1000, "M"],
				[900, "CM"],
				[500, "D"],
				[400, "CD"],
				[100, "C"],
				[90, "XC"],
				[50, "L"],
				[40, "XL"],
				[10, "X"],
				[9, "IX"],
				[5, "V"],
				[4, "IV"],
				[1, "I"],
			],
			{ // Validation constraints for Roman Numeral Conversion
				isValidNumber: isIntegerInRange(1, 3999),
				isValidRule: ([value, symbol]) =>
					isIntegerInRange(1, 1000)(value) && isNonEmptyString(symbol),
				invalidNumberError: "Input must be a positive integer between 1 and 3999.",
				invalidRulesError: "Rules must be an array of [positive integer, non-empty string] pairs.",
			}
		)

		expect(toRoman(1)).toBe("I");
        expect(toRoman(4)).toBe("IV");
        expect(toRoman(5)).toBe("V");
        expect(toRoman(9)).toBe("IX");
        expect(toRoman(10)).toBe("X");
        expect(toRoman(40)).toBe("XL");
        expect(toRoman(50)).toBe("L");
        expect(toRoman(90)).toBe("XC");
        expect(toRoman(100)).toBe("C");
        expect(toRoman(400)).toBe("CD");
        expect(toRoman(500)).toBe("D");
        expect(toRoman(900)).toBe("CM");
        expect(toRoman(1000)).toBe("M");
		expect(toRoman(1987)).toBe("MCMLXXXVII");
	});

	test("Hexadecimal Converter should handle numbers correctly", () => {
		const toHexadecimal = numeral(
			(_, num) => num.toString(16).toUpperCase(),
			[],
			{
				isValidNumber: isIntegerInRange(0), // No upper limit for hexadecimal
				isValidRule: () => true, // No rules needed for hexadecimal
				invalidNumberError: "Number must be a non-negative integer.",
				invalidRulesError: "",
			}
		)

		expect(toHexadecimal(1)).toBe("1");
        expect(toHexadecimal(15)).toBe("F");
        expect(toHexadecimal(255)).toBe("FF");
        expect(toHexadecimal(1000)).toBe("3E8");
        expect(toHexadecimal(16777215)).toBe("FFFFFF");
	});

});

describe("Task Use Case", () => {

	// Mock fetch function to simulate network request with 200ms delay and 30% failure rate
	const mockFetch = (_: string): Promise<Response> => new Promise((resolve, reject) => {
		const response: Response = result(() => Response.json({
			value: [
				{ id: 0, parentId: null, name: "Root" },
				{ id: 1, parentId: 0, name: "Level 1, Item 1" },
				{ id: 2, parentId: 0, name: "Level 1, Item 2" },
				{ id: 3, parentId: 0, name: "Level 1, Item 3" },
				{ id: 4, parentId: 1, name: "Level 2, Item 1.1" },
				{ id: 5, parentId: 1, name: "Level 2, Item 1.2" },
				{ id: 6, parentId: 2, name: "Level 2, Item 2.1" },
				{ id: 7, parentId: 2, name: "Level 2, Item 2.2" },
				{ id: 8, parentId: 2, name: "Level 2, Item 2.3" }
			]
		}))
			// In case Response.json() throws an error, return a mock error response
			.catch((error: Error) => Response.json(
				{ error: error.message },
				{ status: 500, statusText: "Internal Server Error" }
			))
			.get() as Response
		setTimeout(() => Math.random() < 0.3
			? reject(new Error("Mock network error: Request failed"))
			: resolve(response)
		, 200) // Simulate 200ms delay
	})

	// Step 1: Fetch data
	const fetchData = async () => {
		const response = await mockFetch('/api/data')
		if (!response.ok) return err(`Failed to fetch data: ${response.statusText}`)
		return response.json()
	}

	// Step 2: Validate data
	const validateData = (data: any) =>
		typeof data === "object"
			&& "value" in data
			&& Array.isArray(data.value)

	// Step 3: Build tree structure
	const buildTreeStructure = (items: TreeNode[]): TreeStructure => {
		const idMap = new Map<number, TreeNode>()
		const roots = new Set<TreeNode>()
		const orphans = new Set<TreeNode>()
		
		// Populate the idMap
		for (const item of items) {
			item.children = new Set<TreeNode>()
			idMap.set(item.id, item)
		}
			
		// Attach each item to its parent's `children` array if possible
		for (const item of items)
			item.parentId == null
				? roots.add(item)
				: idMap.get(item.parentId)?.children!.add(item)
					|| orphans.add(item)
		
		return { roots, orphans }
	}

	const fetchTreeData = async () => {

		const retry = <T>(
			fn: () => Promise<MaybeResult<T>>,
			retries: number,
			delay: number
		) => task(fn)
				.catch((error: Error) => {
					if (retries <= 0) return err(error)
					return new Promise(resolve => setTimeout(resolve, delay))
						.then(() => retry(fn, retries - 1, delay * 2))
				})

		// 3 attempts, exponential backoff with initial 1000ms delay
		const data = await retry(fetchData, 3, 1000)

		// Validate the data and build the tree structure
		return data
			.filter(validateData)
			.map((x: { value: any[] }) => buildTreeStructure(x.value))
			.match({
				Nil: () => err("Data is invalid, missing 'value', or 'value' is not an array")
			})
	}

	test("returns the correct result", async () => {
		const result = await fetchTreeData()
		if (isErr(result)) expect(result.error.message).toBeString()
		else {
			const obj = result.get() as TreeStructure
            expect(obj.roots).toBeInstanceOf(Set)
			expect(obj.orphans).toBeInstanceOf(Set)
			expect(obj.roots.size).toBeGreaterThan(0)
			expect(obj.orphans.size).toBe(0)
		}
	})

});

// Test Monad Laws for Ok
describe("Monad Laws for Ok", () => {
    test("Left Identity: Ok(x).chain(f) === f(x)", () => {
        const x = 5;
        const f = addOneOk;
        const res1 = ok(x).chain(f);
        const res2 = f(x);
        expect(res1.get()).toBe(res2.get());
    });

    test("Right Identity: Ok(x).chain(Ok) === Ok(x)", () => {
        const x = 5;
        const res1 = ok(x).chain(y => ok(y));
        const res2 = ok(x);
        expect(res1.get()).toBe(res2.get());
    });

    test("Associativity: (Ok(x).chain(f)).chain(g) === Ok(x).chain(x => f(x).chain(g))", () => {
        const x = 5;
        const f = addOneOk;
        const g = doubleOk;
        const res1 = ok(x).chain(f).chain(g);
        const res2 = ok(x).chain(x => f(x).chain(g));
        expect(res1.get()).toBe(res2.get());
    });
});

describe("Async Monad Laws for Ok", () => {
	test("Left Identity: ok(x).await(f) === f(x)", async () => {
		const x = 5;
		const f = async (y: number) => ok(y + 1);
		const res1 = await ok(x).await(f);
		const res2 = await f(x);
		expect(res1.get()).toBe(res2.get());
	});

	test("Right Identity: ok(x).await(async y => ok(y)) === ok(x)", async () => {
		const x = 5;
		const res1 = await ok(x).await(async y => ok(y));
		const res2 = ok(x);
		expect(res1.get()).toBe(res2.get());
	});

	test("Associativity: await ok(x).await(f).then(res => res.await(g)) === await ok(x).await(async y => f(y).then(z => z.await(g))", async () => {
		const x = 5;
		const f = async (y: number) => ok(y + 1); // Async function
		const g = async (y: number) => ok(y * 2); // Async function
	
		// Sequential application of f and then g
		const res1 = await ok(x).await(f).then(res => res.await(g));
	
		// Composition of f and g into a single operation
		const res2 = await ok(x).await(async y => f(y).then(z => z.await(g)));
	
		expect(res1.get()).toBe(res2.get());
	});
});

// Test Monad Laws for Err
describe("Monad Laws for Err", () => {
    test("Left Identity: Err.chain(f) === Err", () => {
        const e = err("Error");
        const f = addOneOk;
        const res = e.chain(f);
        expect(res.error).toBe(e.error);
    });

    test("Right Identity: Err.chain(Ok) === Err", () => {
        const e = err("Error");
        const res = e.chain(ok);
        expect(res.error).toBe(e.error);
    });

    test("Associativity: (Err.chain(f)).chain(g) === Err.chain(x => f(x).chain(g))", () => {
        const e = err("Error");
        const f = addOneOk;
        const g = doubleOk;
        const res1 = e.chain(f).chain(g);
        const res2 = e.chain(x => f(x).chain(g));
        expect(res1.error).toBe(e.error);
        expect(res2.error).toBe(e.error);
    });
});

// Test Monad Laws for Nil
describe("Monad Laws for Nil", () => {
    test("Left Identity: Nil.chain(f) === Nil", () => {
        const f = addOneOk;
        const res = nil().chain(f);
        expect(res.get()).toBe(nil().get());
    });

    test("Right Identity: Nil.chain(Ok) === Nil", () => {
        const res = nil().chain(ok);
        expect(res.get()).toBe(nil().get());
    });

    test("Associativity: (Nil.chain(f)).chain(g) === Nil.chain(x => f(x).chain(g))", () => {
        const f = addOneOk;
        const g = doubleOk;
        const res1 = nil().chain(f).chain(g);
        const res2 = nil().chain(x => f(x).chain(g));
        expect(res1.get()).toBe(nil().get());
        expect(res2.get()).toBe(nil().get());
    });
});

// Test Functor Laws for Ok
describe("Functor Laws for Ok", () => {
    test("Identity: Ok(x).map(x => x) === Ok(x)", () => {
        const x = 5;
        const res1 = ok(x).map(identity);
        const res2 = ok(x);
        expect(res1.get()).toBe(res2.get());
    });

    test("Composition: Ok(x).map(x => f(g(x))) === Ok(x).map(g).map(f)", () => {
        const x = 5;
        const res1 = ok(x).map(x => addOne(double(x))); // map with composition
        const res2 = ok(x).map(double).map(addOne); // map separately
        expect(res1.get()).toBe(res2.get());
    });
});

// Test Functor Laws for Err
describe("Functor Laws for Err", () => {
    test("Identity: Err.map(x => x) === Err", () => {
        const e = err("Error");
        const res = e.map(identity);
        expect(res.error).toBe(e.error);
    });

    test("Composition: Err.map(x => f(g(x))) === Err.map(g).map(f)", () => {
        const e = err("Error");
        const res1 = e.map(x => addOne(double(x))); // map with composition
        const res2 = e.map(double).map(addOne); // map separately
        expect(res1.error).toBe(e.error); // No transformation happens on Err
        expect(res2.error).toBe(e.error); // No transformation happens on Err
    });
});

// Test Functor Laws for Nil
describe("Functor Laws for Nil", () => {
    test("Identity: Nil.map(x => x) === Nil", () => {
        const res = nil().map(identity);
        expect(res.get()).toBe(nil().get());
    });

    test("Composition: Nil.map(x => f(g(x))) === Nil.map(g).map(f)", () => {
        const res1 = nil().map(x => addOne(double(x))); // map with composition
        const res2 = nil().map(double).map(addOne); // map separately
        expect(res1.get()).toBe(nil().get()); // No transformation happens on Nil
        expect(res2.get()).toBe(nil().get()); // No transformation happens on Nil
    });
});

// Ok Monad
describe("Filterable Trait for Ok", () => {
    test("Filter Ok value, predicate true", () => {
        const res = ok(5).filter(isPositive);
        expect(res.get()).toBe(5);
    });

    test("Filter Ok value, predicate false", () => {
        const res = ok(-5).filter(isPositive);
        expect(isNil(res)).toBe(true); // Ok(-5) should be filtered out, resulting in Nil
    });

    test("Filter Ok value with even predicate, true case", () => {
        const res = ok(4).filter(isEven);
        expect(res.get()).toBe(4); // 4 is even, so Ok(4) remains
    });

    test("Filter Ok value with even predicate, false case", () => {
        const res = ok(5).filter(isEven);
        expect(isNil(res)).toBe(true); // 5 is not even, so Nil
    });
});

// Nil Monad
describe("Filterable Trait for Nil", () => {
    test("Filter Nil, always returns Nil", () => {
        const res = nil().filter(isPositive);
        expect(isNil(res)).toBe(true); // Nil remains Nil regardless of predicate
    });
});

// Err Monad
describe("Filterable Trait for Err", () => {
    test("Filter Err, always returns Nil", () => {
        const e = err("Something went wrong");
        const res = e.filter(isPositive);
        expect(isNil(res)).toBe(true); // Err should always result in Nil when filtered
    });
});

// Ok Monad
describe("Guard Trait for Ok", () => {
    test("Guard Ok value, type guard passes", () => {
        const res = ok("hello").guard(isString);
        expect(res.get()).toBe("hello"); // The value is a string, so Ok("hello") remains
    });

    test("Guard Ok value, type guard fails", () => {
		// @ts-expect-error
        const res = ok(5).guard(isString); 
        expect(isNil(res)).toBe(true); // 5 is not a string, so Nil
    });

    test("Guard Ok value with positive number check, passes", () => {
        const res = ok(10).guard(isPositiveNumber);
        expect(res.get()).toBe(10); // 10 is a positive number, so Ok(10) remains
    });

    test("Guard Ok value with positive number check, fails", () => {
        const res = ok(-5).guard(isPositiveNumber);
        expect(isNil(res)).toBe(true); // -5 is not a positive number, so Nil
    });
});

// Nil Monad
describe("Guard Trait for Nil", () => {
    test("Guard Nil, always returns Nil", () => {
        const res = nil().guard(isString);
        expect(isNil(res)).toBe(true); // Nil remains Nil regardless of guard
    });
});

// Err Monad
describe("Guard Trait for Err", () => {
    test("Guard Err, always returns Nil", () => {
        const e = err("Something went wrong");
        const res = e.guard(isString);
        expect(isNil(res)).toBe(true); // Err should always result in Nil when guarded
    });
});

// Ok Monad
describe("Or Trait for Ok", () => {
    test("Ok.or() has no effect, keeps original value", () => {
        const res = ok(5).or(() => 10);
        expect(res.get()).toBe(5); // Ok(5) remains unchanged, or() has no effect
    });

    test("Ok.or() with nullish fallback, keeps original value", () => {
        const res = ok(5).or(() => null);
        expect(res.get()).toBe(5); // Ok(5) remains unchanged, or() has no effect
    });
});

// Nil Monad
describe("Or Trait for Nil", () => {
    test("Nil.or() provides fallback value as Ok", () => {
        const res = nil().or(() => 10);
        expect(res.get()).toBe(10); // Nil becomes Ok(10) with the fallback value
    });

    test("Nil.or() with nullish fallback, remains Nil", () => {
        const res = nil().or(() => null);
        expect(isNil(res)).toBe(true); // Nil remains Nil as fallback is nullish
    });
});

// Err Monad
describe("Or Trait for Err", () => {
    test("Err.or() provides fallback value as Ok", () => {
        const e = err("Something went wrong");
        const res = e.or(() => 10);
        expect(res.get()).toBe(10); // Err becomes Ok(10) with the fallback value
    });

    test("Err.or() with nullish fallback, becomes Nil", () => {
        const e = err("Something went wrong");
        const res = e.or(() => null);
        expect(isNil(res)).toBe(true); // Err becomes Nil as fallback is nullish
    });
});

// Ok Monad
describe("Catch Trait for Ok", () => {
    test("Ok.catch() has no effect, remains Ok", () => {
        const res = ok(5).catch(recoverWithOk);
        expect(res.get()).toBe(5); // Ok(5) remains unchanged, catch() has no effect
    });
});

// Nil Monad
describe("Catch Trait for Nil", () => {
    test("Nil.catch() has no effect, remains Nil", () => {
        const res = nil().catch(recoverWithOk);
        expect(isNil(res)).toBe(true); // Nil remains Nil, catch() has no effect
    });
});

// Err Monad
describe("Catch Trait for Err", () => {
    test("Err.catch() recovers with Ok", () => {
        const e = err("Something went wrong");
        const res = e.catch(recoverWithOk);
        expect(isOk(res)).toBe(true); // Err becomes Ok after recovery
        expect(res.get()).toBe("recovered");
    });

    test("Err.catch() recovers with Nil", () => {
        const e = err("Something went wrong");
        const res = e.catch(recoverWithNil);
        expect(isNil(res)).toBe(true); // Err becomes Nil after recovery
    });

    test("Err.catch() fails with another Err", () => {
        const e = err("Something went wrong");
        const res = e.catch(recoverWithErr);
        expect(isErr(res)).toBe(true); // Err remains Err after failed recovery
        expect(() => res.get()).toThrow("Recovery failed"); // The error message should now reflect the recovery error
    });
});

// Ok Monad
describe("Match Trait for Ok", () => {
    test("Match with Ok handler", () => {
        const res = ok(5).match({ Ok: handleOk });
        expect(isOk(res)).toBe(true); // Ok handler should be applied
        expect(res.get()).toBe(6); // 5 + 1 = 6
    });

    test("Match without Ok handler, passes through", () => {
        const res = ok(5).match({});
        expect(isOk(res)).toBe(true); // Ok remains unchanged
        expect(res.get()).toBe(5);
    });

	test("Match with Gone handler", () => {
        const res = ok({ name: "John" });
        expect(res.get().name).toBe("John");
		expect(isGone(res)).toBe(true); // Gone is true, indicating the value has been consumed already
		const recovered = res.match({ Gone: handleGone });
        expect(isOk(recovered)).toBe(true); // Gone handler should be applied
		expect(recovered.get()).toBe("Recovered from Gone");
    });

	test("Match without Gone handler, returns Err<ReferenceError>", () => {
		const res = ok({ name: "John" });
        expect(res.get().name).toBe("John");
		expect(isGone(res)).toBe(true); // Gone is true, indicating the value has been consumed already
        const error = res.match({});
        expect(isErr(error)).toBe(true); // Refeerence Error is returned, as the value has been consumed already
        expect(() => error.get()).toThrow("Mutable reference has already been consumed");
    });
});

// Nil Monad
describe("Match Trait for Nil", () => {
    test("Match with Nil handler", () => {
        const res = nil().match({ Nil: handleNil });
        expect(isOk(res)).toBe(true); // Nil handler should be applied, resulting in Ok
        expect(res.get()).toBe("Recovered from Nil");
    });

    test("Match without Nil handler, passes through", () => {
        const res = nil().match({});
        expect(isNil(res)).toBe(true); // Nil remains unchanged
    });
});

// Err Monad
describe("Match Trait for Err", () => {
    test("Match with Err handler", () => {
        const e = err("Something went wrong");
        const res = e.match({ Err: handleErr });
        expect(isOk(res)).toBe(true); // Err handler should be applied, recovering to Ok
        expect(res.get()).toBe("Recovered from error: Something went wrong");
    });

    test("Match without Err handler, passes through", () => {
        const e = err("Something went wrong");
        const res = e.match({});
        expect(isErr(res)).toBe(true); // Err remains unchanged
        expect(() => res.get()).toThrow("Something went wrong"); // Error is passed through
    });
});


// Ok Monad
describe("Get Trait for Ok", () => {
    test("Ok.get() returns the contained value", () => {
        const res = ok(5);
        expect(res.get()).toBe(5); // Ok(5) should return 5
    });

	test("Ok.get() returns the contained structured value only once", () => {
        const res = ok({ name: "John" });
        expect(res.get().name).toBe("John"); // Ok({ name: "John" }) should return { name: "John" }
		expect(() => res.get()).toThrow("Mutable reference has already been consumed");
    });
});

// Nil Monad
describe("Get Trait for Nil", () => {
    test("Nil.get() returns undefined", () => {
        const res = nil();
        expect(res.get()).toBe(undefined); // Nil should return undefined
    });
});

// Err Monad
describe("Get Trait for Err", () => {
    test("Err.get() rethrows the contained error", () => {
        const e = err("Something went wrong");
        expect(() => e.get()).toThrow("Something went wrong"); // Err should rethrow the contained error
    });
});

// Tests for maybe()

describe("Maybe Function", () => {
    test("maybe() with non-nullish value returns Ok", () => {
        const res = maybe(5);
        expect(isOk(res)).toBe(true); // maybe(5) should return Ok(5)
        expect(res.get()).toBe(5);
    });

    test("maybe() with null value returns Nil", () => {
        const res = maybe(null);
        expect(isNil(res)).toBe(true); // maybe(null) should return Nil
    });

    test("maybe() with undefined value returns Nil", () => {
        const res = maybe();
        expect(isNil(res)).toBe(true); // maybe() should return Nil
    });
});

// Tests for result()

describe("Result Function", () => {
    test("result() with successful function returns Ok", () => {
        const res = result(() => 10);
        expect(isOk(res)).toBe(true); // result of function should return Ok(10)
        expect(res.get()).toBe(10);
    });

    test("result() with function returning null returns Nil", () => {
        const res = result(() => null);
        expect(isNil(res)).toBe(true); // result of function returning null should return Nil
    });

    test("result() with function throwing error returns Err", () => {
        const res = result(() => {
            throw new Error("Something went wrong");
        });
        expect(isErr(res)).toBe(true); // result of function throwing error should return Err
        expect(() => res.get()).toThrow("Something went wrong"); // Ensure the error is properly thrown
    });
});

// Tests for task()

describe("Task Function", () => {
    test("task() with a successful Promise resolves to Ok", async () => {
        const res = await task(successfulTask);
        expect(isOk(res)).toBe(true); // Task resolves to Ok
        expect(res.get()).toBe(10);
    });

    test("task() with a Promise resolving to null resolves to Nil", async () => {
        const res = await task(nullTask);
        expect(isNil(res)).toBe(true); // Task resolves to Nil
    });

    test("task() with a failing Promise rejects with Err", async () => {
        const res = await task(failingTask);
        expect(isErr(res)).toBe(true); // Task rejects with Err
        expect(() => res.get()).toThrow("Task failed"); // Ensure the error is properly thrown
    });
});

// Tests for flow()

describe("Flow Function", () => {
	test("flow() with a successful Promise resolves to Ok", async () => {
        const res = await flow(
			5,
			double,
			async x => x
				? Promise.resolve(x + 10)
				: Promise.reject("Error in first stage"),
			half
		);
        expect(isOk(res)).toBe(true); // Flow resolves to Ok
        expect(res.get()).toBe(10); // (5 * 2 + 10) / 2 = 10
    });

    test("flow() with a Promise rejecting in the middle rejects with Err", async () => {
		const res = await flow(
			5,
			double,
			async _ => Promise.reject(new Error("Error in second stage")),
			half
        );
        expect(isErr(res)).toBe(true); // Flow rejects with Err
		expect(() => res.get()).toThrow("Error in second stage"); // Ensure the error is properly thrown
	});
});