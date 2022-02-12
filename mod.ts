export type { FromSchemaTop } from "./src/from_schema.ts";
import { asSchemaMatcher } from "./src/parser.ts";
import { toSchema } from "./src/to_schema.ts";

/**
 * Use this to construct a validator from a json-schema.
 */
export const parser = asSchemaMatcher;

export { asSchemaMatcher, toSchema };
