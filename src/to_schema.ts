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
// prettier-ignore
export type ToSchema<A> =
    (
        A extends boolean ? ToSchemaBool<A> :
        A extends (infer A)[] ? ToSchemaArray<A> :
        A extends object ? ToSchemaObject :
        A extends null | undefined ? ToSchemaNill :
        A extends string ? ToSchemaString<A> :
        A extends number ? ToSchemaNumber<A> :
        {}
    ) & {
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
 * @param parserComingIn Convert this parser into a json schema
 * @param definitions Used for recursion later, shouldn't be used by the user
 * @returns
 */
export function toSchema<P extends Parser<A, B>, A, B>(
  parserComingIn: P,
  definitions?: object
): ToSchema<ParserReturn<P>> {
  const parser = unwrapParser(parserComingIn);
  const {
    description: { name, extras, children },
  } = parser;
  if (parser instanceof ShapeParser) {
    return {} as any;
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
  if (parser instanceof GuardParser) {
    return {} as any;
  }
  if (parser instanceof FunctionParser) {
    return {} as any;
  }
  if (parser instanceof NilParser) {
    return {
      type: "null",
      definitions,
    } as any;
  }

  if (parser instanceof StringParser) {
    return {
      type: "string",
      definitions,
    } as any;
  }
  if (parser instanceof ObjectParser) {
    return {
      type: "object",
      definitions,
    } as any;
  }
  if (parser instanceof NumberParser) {
    return {
      type: "number",
      definitions,
    } as any;
  }
  if (parser instanceof BoolParser) {
    return {
      type: "boolean",
      definitions,
    } as any;
  }
  if (parser instanceof AnyParser) {
    return {
      type: "any",
      definitions,
    } as any;
  }
  if (parser instanceof ArrayOfParser) {
    return {
      type: "array",
      items: toSchema(parser.parser, definitions),
    } as any;
  }
  if (parser instanceof ArrayParser) {
    return {
      type: "array",
    } as any;
  }
  if (parser instanceof NamedParser) {
    const { definitions: newDefinitions, ...child } = toSchema(parser.parent, definitions);
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
