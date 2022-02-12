import {
  matchArrayType,
  matchBooleanType,
  matchIntegerType,
  matchNullType,
  matchNumberType,
  matchObjectType,
  matchStringType,
} from "./matchers.ts";

type _<T> = T;
// prettier-ignore
// deno-fmt-ignore
export type MergeAll<T> = 
  T extends ReadonlyArray<infer U> ? ReadonlyArray<MergeAll<U>> :
  T extends object ? (
    T extends null | undefined | never ? T : 
    _<{ [k in keyof T]: MergeAll<T[k]> }>) :
  T;

export type TypeString = typeof matchStringType._TYPE;
export type TypeNumber = typeof matchNumberType._TYPE;
export type TypeInteger = typeof matchIntegerType._TYPE;
export type TypeObject = typeof matchObjectType._TYPE;
export type TypeArray = typeof matchArrayType._TYPE;
export type TypeBoolean = typeof matchBooleanType._TYPE;
export type TypeNull = typeof matchNullType._TYPE;

type AnyInLiteral<T extends Readonly<any> | Array<any>> = T[number];

// prettier-ignore
// deno-fmt-ignore
type ItemType<T, D> = T extends { items: infer U }
  ? ReadonlyArray<FromSchema<U, D>>
  : unknown;
// prettier-ignore
// deno-fmt-ignore
type PropertiesType<T, D> = 
  T extends { properties: infer U; required: infer V } ? (
    V extends (Array<keyof U & string> | ReadonlyArray<keyof U & string>) ? 
    (
      & {
        [K in Exclude<keyof U, AnyInLiteral<V>>]?: FromSchema<U[K], D>;
      }
      & {
        [K in keyof U & AnyInLiteral<V>]: FromSchema<U[K], D>;
      }
    ):
    never
  ):
  T extends { properties: infer U } ? { [K in keyof U]?: FromSchema<U[K], D>; }
  : unknown;
type EnumType<T> = T extends { enum: infer U } ? AnyInLiteral<U> : unknown;
// prettier-ignore
// deno-fmt-ignore
type FromTypeRaw<T> =
  T extends (TypeInteger | TypeNumber) ? number :
  T extends TypeString ? string :
  T extends TypeBoolean ? boolean :
  T extends TypeNull ? null :
  T extends TypeObject ? object :
  T extends TypeArray ? Array<unknown> :
  never

// prettier-ignore
// deno-fmt-ignore
type AnyOfType<T, D> = 
  T extends { anyOf: Array<infer U> | ReadonlyArray<infer U> } | { oneOf: Array<infer U> | ReadonlyArray<infer U>}
    ? FromSchema<U, D>
    : unknown;

// prettier-ignore
// deno-fmt-ignore
type AllTuple<T, D> = 
  T extends [infer A] | readonly [infer A] ? FromSchema<A, D>
  : T extends [infer A, ...infer B] | readonly [infer A, ...infer B] ? (FromSchema<A, D> & AllTuple<B, D>)
  : never
// prettier-ignore
// deno-fmt-ignore
type AllOfType<T, D> = 
  T extends { allOf: infer U } ? (AllTuple<U, D>) : 
  unknown;

// prettier-ignore
// deno-fmt-ignore
type FromTypeProp<T> =
  T extends Array<infer U> | ReadonlyArray<infer U> ? FromTypeRaw<U>
  : FromTypeRaw<T>

// prettier-ignore
// deno-fmt-ignore
type FromType<T> = 
  T extends { type: infer Type } ? FromTypeProp<Type> :
  unknown;

// prettier-ignore
// deno-fmt-ignore
type MatchReference<T, D> = 
  T extends { $ref: `#/definitions/${infer Reference}` } ? (
    Reference extends keyof D ? FromSchema<D[Reference], D> :
    never
  )
  : unknown;

// prettier-ignore
// deno-fmt-ignore
type Definitions<T> = 
  T extends { definitions: infer U } ? (
    U extends {} ? U :
    never
  )
  : {};

type Any<T> = T extends true ? any : unknown;
/**
 * This schema is to pull out the typescript type from a json Schema
 */
// prettier-ignore
// deno-fmt-ignore
export type FromSchema<T, D> = T extends ReadonlyArray<infer U>
  ? FromSchema<U, D>
  : (
    & MatchReference<T, D>
    & Any<T>
    & FromType<T>
    & PropertiesType<T, D>
    & ItemType<T, D>
    & EnumType<T>
    & AnyOfType<T, D>
    & AllOfType<T, D>
  );

/**
 * This schema is to pull out the typescript type from a json Schema
 */
export type FromSchemaTop<T> = MergeAll<FromSchema<T, Definitions<T>>>;
