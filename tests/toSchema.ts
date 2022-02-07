import { asSchemaMatcher } from "../mod.ts";
import {
  Parser,
  object,
  nill,
  string,
  boolean,
  number,
  array,
  arrayOf,
  literal,
  shape,
  every,
} from "../dependencies.ts";
import { describe, expect, it } from "https://deno.land/x/tincan/mod.ts";
import { toSchema } from "../mod.ts";
import { isType } from "./util.ts";
import { ToSchema } from "../src/to_schema.ts";
describe("round trips of primitives", () => {
  it("Object", () => {
    const originalMatcher = object;
    const schema = toSchema(originalMatcher);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = {};
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = 5;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: object(5) given input 5`);
  });

  it("Null", () => {
    const originalMatcher = nill;
    const schema = toSchema(originalMatcher);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = null;
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = 5;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: null(5) given input 5`);
  });

  it("string", () => {
    const originalMatcher = string;
    const schema = toSchema(originalMatcher);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = "test";
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = 5;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: string(5) given input 5`);
  });

  it("number", () => {
    const originalMatcher = number;
    const schema = toSchema(originalMatcher);
    isType<{ type: "number" }>(schema);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = 5;
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<boolean>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = "bad";
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: number("bad") given input "bad"`);
  });

  it("bool", () => {
    const originalMatcher = boolean;
    const schema = toSchema(originalMatcher);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = false;
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = 5;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: boolean(5) given input 5`);
  });
});

it("named parser", () => {
  const originalMatcher: Parser<unknown, object> = object.name("test");
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);

  expect((schema as any).$ref).toBe("#/definitions/test");
  type Type = typeof matcher._TYPE;
  const goodValue: Type = {};
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = 5;
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: object(5) given input 5`);
});

it("array parser", () => {
  const originalMatcher = array;
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);

  type Type = typeof matcher._TYPE;
  const goodValue: Type = [];
  const returnedValue = Array.from(matcher.unsafeCast(goodValue));
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = {};
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ArrayOf<any>({}) given input {}`);
});

it("arrayOf parser", () => {
  const originalMatcher = arrayOf(number);
  const schema = toSchema(originalMatcher);
  isType<ToSchema<number[]>>(schema);
  const matcher = asSchemaMatcher(schema);
  isType<Parser<unknown, readonly number[]>>(matcher);

  type Type = typeof matcher._TYPE;
  const goodValue: Type = [6];
  const returnedValue = Array.from(matcher.unsafeCast(goodValue));
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = ["hello"];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number("hello") given input ["hello"]`);
  expect(() => {
    // @ts-expect-error
    const test: Type = [false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number(false) given input [false]`);
  expect(() => {
    // @ts-expect-error
    const test: Type = [3, false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [1]number(false) given input [3,false]`);
});

it("arrayOf parser with names", () => {
  const originalMatcher = arrayOf(number.name("Im_a_number")).name("Im_an_array");
  const schema = toSchema(originalMatcher);
  isType<ToSchema<number[]>>(schema);
  const matcher = asSchemaMatcher(schema);
  isType<Parser<unknown, readonly number[]>>(matcher);

  type Type = typeof matcher._TYPE;
  const goodValue: Type = [6];
  const returnedValue = Array.from(matcher.unsafeCast(goodValue));
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);
  expect(schema.definitions).toHaveProperty("Im_a_number");
  expect(schema.definitions).toHaveProperty("Im_an_array");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/Im_an_array");

  expect(() => {
    // @ts-expect-error
    const test: Type = ["hello"];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number("hello") given input ["hello"]`);
  expect(() => {
    // @ts-expect-error
    const test: Type = [false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number(false) given input [false]`);
  expect(() => {
    // @ts-expect-error
    const test: Type = [3, false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [1]number(false) given input [3,false]`);
});

describe("given round trips for all primative constants (enums of 1 option)", () => {
  it("string", () => {
    const originalMatcher = literal("hello");
    const schema = toSchema(originalMatcher);
    isType<{ type: "string"; enum: ["hello"] }>(schema);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = "hello";
    const returnedValue = matcher.unsafeCast(goodValue);
    type Type2 = ToSchema<"test">;
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<"bad">(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = "bad";
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: Literal<"hello">("bad") given input "bad"`);
  });

  it("number", () => {
    const originalMatcher = literal(5);
    const schema = toSchema(originalMatcher);
    isType<{ type: "number"; enum: [5] }>(schema);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = 5;
    const returnedValue = matcher.unsafeCast(goodValue);
    type Type2 = ToSchema<"test">;
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<2>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = 4;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: Literal<5>(4) given input 4`);
  });

  it("bool", () => {
    const originalMatcher = literal(true);
    const schema = toSchema(originalMatcher);
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;
    const goodValue: Type = true;
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error
      const test: Type = false;
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: Literal<true>(false) given input false`);
  });
});

it("should round trip for a shape", () => {
  const originalMatcher = shape({ a: literal(5) });
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  isType<Parser<unknown, { a: 5 }>>(matcher);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 5 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<5>(6) given input {"a":6}`);
});

it("should round trip for a shape with name", () => {
  const originalMatcher = shape({ a: literal(12).name("isFive") }).name("isShapeMagic");
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(schema.definitions).toHaveProperty("isFive");
  expect(schema.definitions).toHaveProperty("isShapeMagic");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/isShapeMagic");

  expect(() => {
    // @ts-expect-error
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});

it("should work with an every", () => {
  const originalMatcher = every(shape({ a: literal(12) }), shape({ a: number }));
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});

it("should work with an every with names", () => {
  const originalMatcher = every(
    shape({ a: literal(12).name("AmTwelve") }),
    shape({ a: number.name("someNumber") })
      .name("other")
      .name("superNestings")
  ).name("everything");
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error
  isType<number>(returnedValue);

  expect(schema.definitions).toHaveProperty("AmTwelve");
  expect(schema.definitions).toHaveProperty("other");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/everything");

  expect(() => {
    // @ts-expect-error
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});

// TODO Some
// TODO Complicated references
// TODO Partial
