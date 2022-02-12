// deno-lint-ignore-file no-explicit-any ban-types
import { asSchemaMatcher } from "../mod.ts";
import {
  array,
  arrayOf,
  boolean,
  every,
  literal,
  nill,
  number,
  object,
  Parser,
  partial,
  shape,
  some,
  string,
} from "../dependencies.ts";
import { describe, expect, it } from "https://deno.land/x/tincan/mod.ts";
import { toSchema } from "../mod.ts";
import { isType } from "./util.ts";
import { ToSchema } from "../src/to_schema.ts";
import { complicatedDefinitions } from "./parser.test.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

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
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<boolean>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
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
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
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
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = ["hello"];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number("hello") given input ["hello"]`);
  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = [false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number(false) given input [false]`);
  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = [3, false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [1]number(false) given input [3,false]`);
});

it("arrayOf parser with names", () => {
  const originalMatcher = arrayOf(number.name("Im_a_number")).name(
    "Im_an_array",
  );
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
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);
  expect(schema.definitions).toHaveProperty("Im_a_number");
  expect(schema.definitions).toHaveProperty("Im_an_array");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/Im_an_array");

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = ["hello"];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number("hello") given input ["hello"]`);
  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = [false];
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: [0]number(false) given input [false]`);
  expect(() => {
    // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<"bad">(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<2>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);

    expect(() => {
      // @ts-expect-error: expect to be wrong type
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
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<5>(6) given input {"a":6}`);
});

it("should round trip for a shape with name", () => {
  const originalMatcher = shape({ a: literal(12).name("isFive") }).name(
    "isShapeMagic",
  );
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(schema.definitions).toHaveProperty("isFive");
  expect(schema.definitions).toHaveProperty("isShapeMagic");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/isShapeMagic");

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});
it("should work with an every simple", () => {
  const originalMatcher = every(literal(5), number);
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = 5;
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<6>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = 6;
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: Literal<5>(6) given input 6`);
});

it("should work with an every shapes", () => {
  const originalMatcher = every(
    shape({ a: literal(12) }),
    shape({ a: number }),
  );
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});

it("should work with an every with names", () => {
  const originalMatcher = every(
    shape({ a: literal(12).name("AmTwelve") }),
    shape({ a: number.name("someNumber") })
      .name("other")
      .name("superNestings"),
  ).name("everything");
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = { a: 12 };
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(schema.definitions).toHaveProperty("AmTwelve");
  expect(schema.definitions).toHaveProperty("other");
  expect(schema).toHaveProperty("$ref");
  expect((schema as any).$ref).toEqual("#/definitions/everything");

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<12>(6) given input {"a":6}`);
});

describe("should work with an some with names", () => {
  const originalMatcher = some(number, string).name("everything");
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  it("should work with number", () => {
    const goodValue: Type = 5;
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);
    // @ts-expect-error: expect to be wrong type
    isType<string>(returnedValue);
  });
  it("should work with string", () => {
    const goodValue: Type = "some string";
    const returnedValue = matcher.unsafeCast(goodValue);
    isType<typeof originalMatcher._TYPE>(returnedValue);
    isType<typeof matcher._TYPE>(returnedValue);
    isType<Type>(returnedValue);
    // @ts-expect-error: expect to be wrong type
    isType<number>(returnedValue);
  });
  it("should fail on something that is not in some", () => {
    expect(() => {
      // @ts-expect-error: expect to be wrong type
      const test: Type = { a: 6 };
      matcher.unsafeCast(test);
    }).toThrow(`Failed type: Or<number,...>({"a":6}) given input {"a":6}`);
  });
});

it("should round trip for a partial", () => {
  const originalMatcher = partial({ a: literal(5) });
  const schema = toSchema(originalMatcher);
  const matcher = asSchemaMatcher(schema);
  isType<Parser<unknown, { a?: 5 }>>(matcher);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = {};
  const returnedValue = matcher.unsafeCast(goodValue);
  isType<typeof originalMatcher._TYPE>(returnedValue);
  isType<typeof matcher._TYPE>(returnedValue);
  isType<Type>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<number>(returnedValue);

  expect(() => {
    // @ts-expect-error: expect to be wrong type
    const test: Type = { a: 6 };
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: ["a"]Literal<5>(6) given input {"a":6}`);
});

it("should do a full round trip with the complicated defintion", () => {
  const matcher = asSchemaMatcher(
    {
      type: "array",
      items: {
        $ref: "#/definitions/JsonRpcResponse",
      },
      definitions: complicatedDefinitions,
    } as const,
  );
  type Type = typeof matcher._TYPE;

  const schema = toSchema(matcher);
  isType<ToSchema<Type>>(schema);

  const matcher2 = asSchemaMatcher(schema);
  type Type2 = typeof matcher._TYPE;

  const valid: Type = [
    {
      id: "123",
      result: {
        P3KExecuteQuote: {
          Ok: {
            price: "string",
            request_id: "string",
          },
        },
      },
    },
  ];
  const returnedValue = matcher.unsafeCast(valid);
  isType<Type>(returnedValue);
  isType<Type2>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<5>(returnedValue);
  // @ts-expect-error: expect to be wrong type
  isType<{}[]>(returnedValue);

  const returnedValue2 = Array.from(matcher2.unsafeCast(valid));
  isType<Type>(returnedValue2);
  isType<Type2>(returnedValue2);
  // @ts-expect-error: expect to be wrong type
  isType<5>(returnedValue2);
  // // @ts-expect-error: expect to be wrong type
  // isType<{}[]>(returnedValue2);

  expect(() => {
    const valid: Type = [
      {
        id: "123",
        result: {
          // @ts-expect-error: expect to be wrong type
          P3KExecute3Quote: {
            Ok: {
              price: "string",
              request_id: "string",
            },
          },
        },
      },
    ];
    matcher.unsafeCast(valid);
  }).toThrow(
    `Failed type: [0]["result"]["P3KExecutedQuotes"]Or<Concat<Concat<object,Shape<{P3KSendRequest:any}>>,Partial<{P3KSendRequest:Or<Concat<Concat<object,Shape<{Ok:any}>>,Partial<{Ok:Concat<Concat<object,Shape<{expiration_time:any,price:any,request_id:any,size:any}>>,Partial<{expiration_time:string,price:string,request_id:string,size:number}>>}>>,...>}>>,...>("missingProperty") given input [{"id":"123","result":{"P3KExecute3Quote":{"Ok":{"price":"string","request_id":"string"}}}}]`,
  );

  expect(() => {
    const valid: Type = [
      {
        id: "123",
        result: {
          P3KExecuteQuote: {
            Ok: {
              // @ts-expect-error: expect to be wrong type
              pri4ce: "string",
              request_id: "string",
            },
          },
        },
      },
    ];
    matcher.unsafeCast(valid);
  }).toThrow(
    `Failed type: [0]["result"]["P3KExecutedQuotes"]Or<Concat<Concat<object,Shape<{P3KSendRequest:any}>>,Partial<{P3KSendRequest:Or<Concat<Concat<object,Shape<{Ok:any}>>,Partial<{Ok:Concat<Concat<object,Shape<{expiration_time:any,price:any,request_id:any,size:any}>>,Partial<{expiration_time:string,price:string,request_id:string,size:number}>>}>>,...>}>>,...>("missingProperty") given input [{"id":"123","result":{"P3KExecuteQuote":{"Ok":{"pri4ce":"string","request_id":"string"}}}}]`,
  );
});

it("to schema test shape for literal", () => {
  const matcher = shape(
    { a: literal(5), b: literal("5").name("Is_string_5") },
    ["b"],
  );
  const schema = toSchema(matcher);
  assertEquals(schema, {
    allOf: [
      {
        type: "object",
        properties: {
          b: { $ref: "#/definitions/Is_string_5" },
        },
        required: [],
      },
      {
        type: "object",
        properties: {
          a: {
            type: "number",
            enum: [5],
          },
        },
        required: ["a"],
      },
    ],
    definitions: { Is_string_5: { type: "string", enum: ["5"] } },
  });
});
