import { asSchemaMatcher } from "../mod.ts";
import { Parser, object, nill, string, boolean, number, array, arrayOf } from "../dependencies.ts";
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

// TODO Constants
// TODO Shapes
// TODO Every
// TODO Some
// TODO Complicated references
// TODO ArrayOf With Definition
// TODO Sahpes With Definition
