import {
  Validator,
  every,
  any,
  arrayOf,
  shape,
  some,
  partial,
  literal,
  object,
  matches,
  number,
  string,
  boolean,
  nill,
} from "../dependencies.ts";
import { FromSchemaTop } from "./from_schema.ts";
import {
  matchItems,
  matchRequireds,
  matchAnyOf,
  matchAllOf,
  matchPropertiesShape,
  matchEnum,
  matchRef,
  matchTypeShape,
  matchIntegerType,
  matchNumberType,
  matchObjectType,
  matchStringType,
  matchBooleanType,
  matchNullType,
  matchArrayType,
} from "./matchers.ts";

/**
 * This is the main function. Use this to turn a json-schema into a validator. Is
 * built on the ts-matches validator since that is a validator that also gives the
 * types out for typescript.
 * @param schema So this is a json schema that we want to turn into a validator
 */
export function asSchemaMatcher<T>(schema: T, definitions?: unknown): Validator<unknown, FromSchemaTop<T>> {
  const coalesceDefinitions = definitions || (schema as any)?.definitions || null;
  if (Array.isArray(schema)) {
    return matchAllOfFrom(
      {
        allOf: schema,
      },
      definitions
    );
  }
  return every(
    matchReferenceFrom(schema, coalesceDefinitions),
    matchTypeFrom(schema, coalesceDefinitions),
    matchRequiredFrom(schema, coalesceDefinitions),
    matchPropertiesFrom(schema, coalesceDefinitions),
    matchItemsFrom(schema, coalesceDefinitions),
    matchEnumFrom(schema, coalesceDefinitions),
    matchAnyOfFrom(schema, coalesceDefinitions),
    matchAllOfFrom(schema, coalesceDefinitions)
  );
}

function matchItemsFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchItems.test(schema)) {
    return any;
  }
  return arrayOf(asSchemaMatcher<any>(schema.items, definitions));
}

function matchRequiredFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchRequireds.test(schema)) {
    return any;
  }
  let requireds: { [key: string]: Validator<unknown, unknown> } = {};

  for (const key of schema.required) {
    requireds[key] = any;
  }

  return shape(requireds);
}

function matchAnyOfFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchAnyOf.test(schema)) {
    return any;
  }
  if ("anyOf" in schema) {
    return some(...schema.anyOf.map((x) => asSchemaMatcher<any>(x, definitions)));
  }
  return some(...schema.oneOf.map((x) => asSchemaMatcher<any>(x, definitions)));
}

function matchAllOfFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchAllOf.test(schema)) {
    return any;
  }
  return every(
    // ts-ignore
    ...schema.allOf.map((x) => asSchemaMatcher<any>(x, definitions))
  );
}

function matchPropertiesFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchPropertiesShape.test(schema)) {
    return any;
  }
  const properties = schema.properties;
  const propertyKeys = Object.keys(properties);
  let shape: { [key: string]: Validator<unknown, unknown> } = {};

  for (const key of propertyKeys) {
    const matcher = asSchemaMatcher<any>((properties as any)[key], definitions);
    shape[key] = matcher;
  }
  return partial(shape);
}

function matchEnumFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchEnum.test(schema)) {
    return any;
  }
  return some(...schema.enum.map((x) => literal(x)));
}

function matchReferenceFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchRef.test(schema)) {
    return any;
  }
  if (!object.test(definitions)) {
    throw new TypeError("Expecting some definitions");
  }
  const referenceId = schema.$ref.replace(/^#\/definitions\//, "");
  const referenceSchema = referenceId in definitions && (definitions as any)[referenceId];
  if (!referenceId || !referenceSchema) {
    throw new TypeError(`Expecting the schema reference be something ${schema.$ref} in ${JSON.stringify(definitions)}`);
  }
  return asSchemaMatcher(referenceSchema, definitions);
}

function matchTypeFrom(schema: unknown, definitions: any): Validator<unknown, any> {
  if (!matchTypeShape.test(schema)) {
    return any;
  }
  const type = schema.type;
  if (arrayOf(any).test(type)) {
    return some(...type.map(matchTypeFrom));
  }
  return matches<Validator<unknown, any>>(type)
    .when(matchIntegerType, () => number)
    .when(matchNumberType, () => number)
    .when(matchObjectType, () => object)
    .when(matchStringType, () => string)
    .when(matchBooleanType, () => boolean)
    .when(matchNullType, () => nill)
    .when(matchArrayType, () => {
      return arrayOf(any);
    })
    .defaultToLazy(() => {
      throw new Error(`Unknown schema: ${type}`);
    });
}
