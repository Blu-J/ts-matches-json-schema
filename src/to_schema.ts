import {
  AnyParser,
  ArrayParser,
  BoolParser,
  FunctionParser,
  GuardParser,
  IParser,
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

type ToSchemaObject = {
  type: "object";
};
type ToSchemaNill = {
  type: "null";
};

// prettier-ignore
export type ToSchema<A> =
    A extends object ? ToSchemaObject :
    A extends null | undefined ? ToSchemaNill :
    never

export type ParserReturn<A> = A extends Parser<any, infer U> ? U : never;
const test = toSchema(object);

function unwrapParser(a: IParser<unknown, unknown>): IParser<unknown, unknown> {
  if (a instanceof Parser) return unwrapParser(a.parser);
  return a;
}
type Test = typeof test;
export function toSchema<P extends Parser<A, B>, A, B>(parserComingIn: P): ToSchema<ParserReturn<P>> {
  const parser = unwrapParser(parserComingIn);
  const {
    description: { name, extras, children },
  } = parser;
  if (parser instanceof ShapeParser) {
    return {} as any;
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
      type: "bool",
    } as any;
  }
  if (parser instanceof AnyParser) {
    return {
      type: "any",
    } as any;
  }
  if (parser instanceof ArrayParser) {
    return {} as any;
  }
  const specifiers = [...extras.map(saferStringify), ...children.map(Parser.parserAsString)];
  const specifiersString = `<${specifiers.join(",")}>`;
  const childrenString = !children.length ? "" : `<>`;

  return {} as any;
  //   return `${name}${specifiersString}`;
}
