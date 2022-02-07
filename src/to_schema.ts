import {
  AnyParser,
  ArrayOfParser,
  ArrayParser,
  BoolParser,
  FunctionParser,
  GuardParser,
  IParser,
  LiteralsParser,
  NamedParser,
  NilParser,
  NumberParser,
  object,
  ObjectParser,
  OrParsers,
  Parser,
  saferStringify,
  ShapeParser,
  StringParser,
  ConcatParsers,
} from "../dependencies.ts";

type nonLiteralsAreNever<A, AnyLiteralValueInTypeA> =
  | Exclude<AnyLiteralValueInTypeA, A>
  | Exclude<A, Exclude<A, AnyLiteralValueInTypeA>>;
// prettier-ignore
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
type ToSchemaNumber<A extends number> = {
  type: "number";
} & isLiteral<A, { enum: [A] }, {}, 3>;
type ToSchemaBool<A> = {
  type: "boolean";
} & isLiteral<A, { enum: [A] }, {}, true>;
type ToSchemaArray<A> = {
  type: "array";
  items: ToSchema<A>;
};

type toSchemaShape<A extends { [key: string]: any }> = {
  type: "object";
  properties: {
    [K in keyof A]: ToSchema<A[K]>;
  };
  required: Array<keyof A>;
};

type test = toSchemaShape<{
  a: 5;
}>;
// prettier-ignore
export type ToSchema<A> =
    (
        A extends boolean ? ToSchemaBool<A> :
        A extends (infer A)[] | readonly (infer A)[]  ? ToSchemaArray<A> :
        A extends object ?
          keyof A extends never ? ToSchemaObject :
          toSchemaShape<A> :
        A extends null | undefined ? ToSchemaNill :
        A extends string ? ToSchemaString<A> :
        A extends number ? ToSchemaNumber<A> :
        {}
    )
& {
    definitions?: {
        [K in keyof A]: ToSchema<any>;
    }
}

export type ParserReturn<A> = A extends Parser<any, infer U> ? U : never;
const test = toSchema(object);

function unwrapParser(a: IParser<unknown, unknown>): IParser<unknown, unknown> {
  if (a instanceof Parser) return unwrapParser(a.parser);
  return a;
}
type Test = typeof test;
/**
 * Converting from a schema parser to a json schema type
 *
 * Note: Return type will work when consumed by asSchemaMatcher, but may not be correct. We know this might be the case with every and some types.
 * @param parserComingIn Convert this parser into a json schema
 * @param definitions Used for recursion later, shouldn't be used by the user
 * @returns
 */
export function toSchema<P extends Parser<A, B>, A, B>(parserComingIn: P): ToSchema<ParserReturn<P>> {
  const parser = unwrapParser(parserComingIn);
  const {
    description: { name, extras, children },
  } = parser;
  if (parser instanceof ShapeParser) {
    const { parserMap } = parser.parserMap;
    type ParserMap = typeof parserMap;
    const finalDefinitions = {} as any;
    const properties = {} as { [K: string]: ToSchema<any> };
    for (const [key, value] of Object.entries(parser.parserMap)) {
      const { definitions, ...schema } = toSchema(value);
      properties[key] = schema;
      Object.assign(finalDefinitions, definitions);
    }
    return { type: "object", properties, definitions: finalDefinitions } as any;
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
    // const parent = unwrapParser(parser.parent);
    // const parentString = toSchema(parent);
    // if (parent instanceof OrParsers) return parentString;

    // return {} as any;
  }
  if (parser instanceof OrParsers) {
    return {} as any;
    // const parent = unwrapParser(parser.parent);
    // const parentString = toSchema(parent);
    // if (parent instanceof OrParsers) return parentString;

    // return {} as any;
  }
  if (parser instanceof ConcatParsers) {
    const { parent, otherParser } = parser;
    const { definitions, ...left } = toSchema(parent);
    const { definitions: otherDefinitions, ...right } = toSchema(otherParser);
    Object.assign(definitions, otherDefinitions);
    return { allOf: [left, right], definitions } as any;
    // const parent = unwrapParser(parser.parent);
    // const parentString = toSchema(parent);
    // if (parent instanceof OrParsers) return parentString;

    // return {} as any;
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
    return {
      type: "any",
    } as any;
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
  const specifiers = [...extras.map(saferStringify), ...children.map(Parser.parserAsString)];
  const specifiersString = `<${specifiers.join(",")}>`;
  const childrenString = !children.length ? "" : `<>`;

  return {} as any;
  //   return `${name}${specifiersString}`;
}
