// deno-lint-ignore-file no-explicit-any ban-types
import {
  AnyParser,
  ArrayOfParser,
  ArrayParser,
  BoolParser,
  ConcatParsers,
  FunctionParser,
  GuardParser,
  IParser,
  LiteralsParser,
  MappedAParser,
  NamedParser,
  NilParser,
  NumberParser,
  ObjectParser,
  OrParsers,
  Parser,
  ShapeParser,
  StringParser,
} from "../dependencies.ts";

type nonLiteralsAreNever<A, AnyLiteralValueInTypeA> =
  | Exclude<AnyLiteralValueInTypeA, A>
  | Exclude<A, Exclude<A, AnyLiteralValueInTypeA>>;
// prettier-ignore
// deno-fmt-ignore
type isLiteral<A, IsLiteral, NotLiteral, AnyLiteralValueInTypeA  > = 
(nonLiteralsAreNever<A, AnyLiteralValueInTypeA>) extends never ? NotLiteral  : IsLiteral;

type ToSchemaObject = {
  type: "object";
};
type ToSchemaNill = {
  type: "null";
};

type ToSchemaString<A extends string> = {
  type: "string";
} & isLiteral<A, { enum: [A] }, {}, "a">;

// prettier-ignore
// deno-fmt-ignore
type ToSchemaNumber<A extends number> = 
  { type: "number"; } & isLiteral<A, { enum: [A] }, {}, 3>;
type ToSchemaBool<A> = {
  type: "boolean";
} & isLiteral<A, { enum: [A] }, {}, true>;
type ToSchemaArray<A> = {
  type: "array";
  items: ToSchema<A>;
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type toSchemaShape<A extends { [key: string]: any }> = {
  type: "object";
  properties: {
    [K in keyof Required<A>]-?: ToSchema<Required<A>[K]>;
  };
  required: Array<RequiredKeys<A>>;
};
// prettier-ignore
// deno-fmt-ignore
export type ToSchema<A> =
  & (
    A extends boolean ? ToSchemaBool<A>
    : A extends (infer A)[] | readonly (infer A)[] ? ToSchemaArray<A>
    : A extends object ? keyof A extends never ? ToSchemaObject
    : toSchemaShape<A>
    : A extends null | undefined ? ToSchemaNill
    : A extends string ? ToSchemaString<A>
    : A extends number ? ToSchemaNumber<A>
    : {}
  )
  & {
    definitions?: {
      [K in keyof A]: ToSchema<any>;
    };
  };

export type ParserReturn<A> = A extends Parser<any, infer U> ? U : never;

function unwrapParser(a: IParser<unknown, unknown>): IParser<unknown, unknown> {
  if (a instanceof Parser) return unwrapParser(a.parser);
  return a;
}
/**
 * Converting from a schema parser to a json schema type
 *
 * Note: Return type will work when consumed by asSchemaMatcher, but may not be correct. We know this might be the case with every and some types.

  * ```ts
  * import { literal, shape } from "https://deno.land/x/ts_matches@5.1.4/mod.ts";
  * const matcher = shape({ a: literal(5), b: literal("5").name("Is_string_5") }, ["b"]);
  * const schema = toSchema(matcher);
  * assertEquals(schema, {
    * allOf: [
      * {
        * type: "object",
        * properties: {
          * b: { $ref: "#/definitions/Is_string_5" },
        * },
        * required: [],
      * },
      * {
        * type: "object",
        * properties: {
          * a: {
            * type: "number",
            * enum: [5],
          * },
        * },
        * required: ["a"],
      * },
    * ],
    * definitions: { Is_string_5: { type: "string", enum: ["5"] } },
  * });
  * ```
 * @param parserComingIn Convert this parser into a json schema
 * @param definitions Used for recursion later, shouldn't be used by the user
 * @returns
 */
export function toSchema<P extends Parser<A, B>, A, B>(
  parserComingIn: P,
): ToSchema<ParserReturn<P>> {
  const parser = unwrapParser(parserComingIn);
  if (parser instanceof ShapeParser) {
    const { parserMap } = parser.parserMap;
    type ParserMap = typeof parserMap;
    const finalDefinitions = {} as any;
    const properties = {} as { [K: string]: ToSchema<any> };
    const required = parser.isPartial
      ? []
      : Array.from(Object.keys(parser.parserMap));
    for (const [key, value] of Object.entries(parser.parserMap)) {
      const { definitions, ...schema } = toSchema(value);
      properties[key] = schema;
      Object.assign(finalDefinitions, definitions);
    }
    return {
      type: "object",
      properties,
      definitions: finalDefinitions,
      required,
    } as any;
  }
  if (parser instanceof LiteralsParser) {
    const { values } = parser;
    if (values.length === 1) {
      return {
        type: typeof values[0],
        enum: values,
      } as any;
    }
    return {} as any;
  }
  if (parser instanceof OrParsers) {
    const { parent, otherParser } = parser;
    const { definitions: leftDefinitions, ...left } = toSchema(parent);
    const { definitions: otherDefinitions, ...right } = toSchema(otherParser);
    const definitions = { ...leftDefinitions, ...otherDefinitions };
    return { oneOf: [left, right], definitions } as any;
  }
  if (parser instanceof ConcatParsers) {
    const { parent, otherParser } = parser;
    const { definitions: leftDefinitions, ...left } = toSchema(parent);
    const { definitions: otherDefinitions, ...right } = toSchema(otherParser);
    const definitions = { ...leftDefinitions, ...otherDefinitions };
    return { allOf: [left, right], definitions } as any;
  }
  if (parser instanceof GuardParser) {
    return {} as any;
  }
  if (parser instanceof FunctionParser) {
    return {} as any;
  }
  if (parser instanceof NilParser) {
    return {
      type: "null",
    } as any;
  }

  if (parser instanceof StringParser) {
    return {
      type: "string",
    } as any;
  }
  if (parser instanceof ObjectParser) {
    return {
      type: "object",
    } as any;
  }
  if (parser instanceof NumberParser) {
    return {
      type: "number",
    } as any;
  }
  if (parser instanceof BoolParser) {
    return {
      type: "boolean",
    } as any;
  }
  if (parser instanceof AnyParser) {
    return {} as any;
  }
  if (parser instanceof ArrayOfParser) {
    const { definitions, ...items } = toSchema(parser.parser);
    return {
      type: "array",
      items,
      definitions,
    } as any;
  }
  if (parser instanceof ArrayParser) {
    return {
      type: "array",
    } as any;
  }
  if (parser instanceof NamedParser) {
    const { definitions: newDefinitions, ...child } = toSchema(parser.parent);
    const parserName = `#/definitions/${parser.name}`;
    return {
      $ref: parserName,
      definitions: {
        ...newDefinitions,
        [parser.name]: child,
      },
    } as any;
  }
  if (parser instanceof MappedAParser) {
    return toSchema(parser.parent) as any;
  }
  console.error(parserComingIn);
  throw new Error("Should never get here");
}
