import { literal, shape, any, object, arrayOf, string, some, number, boolean, nill } from "../dependencies.ts";

export const matchStringType = literal("string");
export const matchNumberType = literal("number");
export const matchIntegerType = literal("integer");
export const matchObjectType = literal("object");
export const matchArrayType = literal("array");
export const matchBooleanType = literal("boolean");
export const matchNullType = literal("null");

export const matchTypeShape = shape({ type: any });
export const matchItems = shape({ items: object });
export const matchPropertiesShape = shape({
  properties: object,
});
export const matchRequireds = shape({
  required: arrayOf(string),
});
export const matchEnum = shape({
  enum: arrayOf(some(string, number, boolean, nill)),
});
export const matchRef = shape({
  $ref: string,
});
export const matchAnyOf = some(
  shape({
    anyOf: arrayOf(object),
  }),
  shape({
    oneOf: arrayOf(object),
  })
);
export const matchAllOf = shape({
  allOf: arrayOf(object),
});
