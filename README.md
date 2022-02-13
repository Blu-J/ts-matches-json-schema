# ts-matches-json-schema

[![Coverage Status](https://coveralls.io/repos/github/Blu-J/ts-matches-json-schema/badge.svg?branch=master)](https://coveralls.io/github/Blu-J/ts-matches-json-schema?branch=master)

The problem that we want solved is that we have generated out some [JSON-Schema](https://json-schema.org/),
but we would like the types in typescript. As well, we would like to validate
these types are valid (throw/ case switch).

So this is going to be a subset of the potential json schema. If I can't get a
typescript type from the schema, then I'm probably not going to be making a validation. If
you want to have full validation, but no typescript types, something like
[AJV.js](https://ajv.js.org/) is going to fit your bill better.

## Example Usuage

Usage of converting from a schema to a parser/ ts-matcher

```ts
// Here we have brought in the test schema. This schema was cloned off
// https://json-schema.org/learn/getting-started-step-by-step.html
// except the reference.
// Notice: There is the `as const`. Currenlty one cannot import from csv with the const
const testSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "http://example.com/product.schema.json",
  title: "Product",
  description: "A product from Acme's catalog",
  type: "object",
  properties: {
    productId: {
      description: "The unique identifier for a product",
      type: "integer",
    },
    productName: {
      description: "Name of the product",
      type: "string",
    },
    isProduct: {
      description: "Name of the product",
      type: "boolean",
    },
    price: {
      description: "The price of the product",
      type: "number",
      exclusiveMinimum: 0,
    },
    tags: {
      description: "Tags for the product",
      type: "array",
      items: {
        type: "string",
      },
      minItems: 1,
      uniqueItems: true,
    },
    extras: {
      description: "Tags for the product",
      type: "array",
      minItems: 1,
      uniqueItems: true,
    },
    dimensions: {
      type: "object",
      properties: {
        length: {
          type: "number",
        },
        width: {
          type: "number",
        },
        height: {
          type: "number",
        },
      },
      required: ["length", "width", "height"],
    },
  },
  required: ["productId", "productName", "price"],
} as const;

// Here we create our matcher
const matchTestSchema = asSchemaMatcher(testSchema);
// If we want to pull out the generated type from the matcher for typescript
type TestSchema = typeof matchTestSchema._TYPE;

// Here we are going to create a json to test the shape
const validShape = {
  productId: 0,
  price: 0.4,
  productName: "test",
  tags: ["5"],
  extras: ["string", 4],
  isProduct: false,
  dimensions: {
    length: 7.0,
    width: 12.0,
    height: 9.5,
  },
};

// So here, we are going to validate the shape.
// Note: Return type of unsafeCast is TestSchema here, so we don't manually
// need to tell typescript what the type is.
// Note: If this fails with unsafeCast, it will throw. There are other methods in the validator that will not throw.
const validShape: TestSchema = matchTestSchema.unsafeCast(validShape);
```

Convert a parser into a schema

```ts
import { literal, shape } from "https://deno.land/x/ts_matches@5.1.4/mod.ts";
const matcher = shape({ a: literal(5), b: literal("5").name("Is_string_5") }, ["b"]);
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
```

## Features

- [x] Convert parser into a schema
- [x] Simple Type Validation
- [x] Enum Type Validation
- [x] allOf/ anyOf type
- [x] Type allowed to be array of types
- [x] References to other schemas
- [ ] Limit Validations (min/ max)
