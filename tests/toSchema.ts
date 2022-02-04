import { asSchemaMatcher } from "../mod.ts";
import { Parser, object, nill } from "../dependencies.ts";
import { describe, expect, it } from "https://deno.land/x/tincan/mod.ts";
import { toSchema } from "../mod.ts";
import { isType } from "./util.ts";

it("Round Trip Object", () => {
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

it("Round Trip Null", () => {
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
