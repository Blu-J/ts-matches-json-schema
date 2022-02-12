import { asSchemaMatcher } from "../mod.ts";
import { describe, expect, it } from "https://deno.land/x/tincan/mod.ts";
import { Parser } from "../dependencies.ts";
import { isType } from "./util.ts";

// const { test } = Deno;

export const complicatedDefinitions = {
  Currency: {
    type: "string",
    description: "currencies available",
    enum: ["USD", "ETH", "BTC"],
  },
  ExecutionRequest: {
    type: "object",
    description: "currencies available",
    required: ["limit", "request_id"],
    properties: {
      limit: {
        type: "integer",
        format: "int64",
      },
      request_id: {
        type: "string",
        format: "uuid",
      },
    },
  },
  ExecutionResponse: {
    type: "object",
    required: ["price", "request_id"],
    properties: {
      price: {
        type: "string",
      },
      request_id: {
        type: "string",
        format: "uuid",
      },
    },
  },
  HandlerResult: {
    anyOf: [
      {
        type: "object",
        required: ["P3KSendRequest"],
        properties: {
          P3KSendRequest: {
            $ref: "#/definitions/Result_of_QuoteResponse_or_String",
          },
        },
      },
      {
        type: "object",
        required: ["P3KExecuteQuote"],
        properties: {
          P3KExecuteQuote: {
            $ref: "#/definitions/Result_of_ExecutionResponse_or_String",
          },
        },
      },
      {
        type: "object",
        required: ["P3KQuotes"],
        properties: {
          P3KQuotes: {
            $ref: "#/definitions/Result_of_Array_of_QuoteRequest_or_String",
          },
        },
      },
      {
        type: "object",
        required: ["P3KExecutedQuotes"],
        properties: {
          P3KExecutedQuotes: {
            $ref: "#/definitions/Result_of_Array_of_ExecutionRequest_or_String",
          },
        },
      },
    ],
  },
  JsonRpcResponse: {
    type: "object",
    required: ["id", "result"],
    properties: {
      id: true,
      result: {
        $ref: "#/definitions/HandlerResult",
      },
    },
  },
  QuoteRequest: {
    type: "object",
    required: ["base_currency", "quote_currency", "request_id", "side", "size"],
    properties: {
      base_currency: {
        $ref: "#/definitions/Currency",
      },
      quote_currency: {
        $ref: "#/definitions/Currency",
      },
      request_id: {
        type: "string",
        format: "uuid",
      },
      side: {
        $ref: "#/definitions/Side",
      },
      size: {
        type: "integer",
        format: "int64",
      },
      size_in_quote: {
        type: ["boolean", "null"],
      },
    },
  },
  QuoteResponse: {
    type: "object",
    required: ["expiration_time", "price", "request_id", "size"],
    properties: {
      expiration_time: {
        type: "string",
        format: "date-time",
      },
      price: {
        type: "string",
      },
      request_id: {
        type: "string",
        format: "uuid",
      },
      size: {
        type: "integer",
        format: "int64",
      },
    },
  },
  Result_of_Array_of_ExecutionRequest_or_String: {
    oneOf: [
      {
        type: "object",
        required: ["Ok"],
        properties: {
          Ok: {
            type: "array",
            items: {
              $ref: "#/definitions/ExecutionRequest",
            },
          },
        },
      },
      {
        type: "object",
        required: ["Err"],
        properties: {
          Err: {
            type: "string",
          },
        },
      },
    ],
  },
  Result_of_Array_of_QuoteRequest_or_String: {
    oneOf: [
      {
        type: "object",
        required: ["Ok"],
        properties: {
          Ok: {
            type: "array",
            items: {
              $ref: "#/definitions/QuoteRequest",
            },
          },
        },
      },
      {
        type: "object",
        required: ["Err"],
        properties: {
          Err: {
            type: "string",
          },
        },
      },
    ],
  },
  Result_of_ExecutionResponse_or_String: {
    oneOf: [
      {
        type: "object",
        required: ["Ok"],
        properties: {
          Ok: {
            $ref: "#/definitions/ExecutionResponse",
          },
        },
      },
      {
        type: "object",
        required: ["Err"],
        properties: {
          Err: {
            type: "string",
          },
        },
      },
    ],
  },
  Result_of_QuoteResponse_or_String: {
    oneOf: [
      {
        type: "object",
        required: ["Ok"],
        properties: {
          Ok: {
            $ref: "#/definitions/QuoteResponse",
          },
        },
      },
      {
        type: "object",
        required: ["Err"],
        properties: {
          Err: {
            type: "string",
          },
        },
      },
    ],
  },
  Side: {
    type: "string",
    enum: ["Buy", "Sell"],
  },
} as const;

it("invalid type will throw", () => {
  expect(() => {
    asSchemaMatcher({ type: "invalid" } as any);
  }).toThrow(`Unknown schema: invalid`);
});

it("Validate simple object", () => {
  const schema = {
    type: "object",
  } as const;
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = {};
  matcher.unsafeCast(goodValue);

  expect(() => {
    // @ts-expect-error
    const test: Type = 5;
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: object(5) given input 5`);
});
it("null checking", () => {
  const schema = {
    type: "null",
  } as const;
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  const goodValue: Type = null;
  matcher.unsafeCast(goodValue);

  expect(() => {
    // @ts-expect-error
    const test: typeof matcher._TYPE = "test";
    matcher.unsafeCast(test);
  }).toThrow(`Failed type: null("test") given input "test"`);
});

it("Missing schema", () => {
  const matcher = asSchemaMatcher(null);
  type Type = typeof matcher._TYPE;
  const valid = false;
  matcher.unsafeCast(valid);
});
describe("references", () => {
  it("Missing definition for reference in array", () => {
    expect(() => {
      const schema = {
        type: "array",
        items: {
          $ref: "#/definitions/Currencies",
        },
        definitions: {
          Currency: {
            type: "string",
            enum: ["USD", "ETH", "BTC"],
          },
        },
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
    }).toThrow(
      `Expecting the schema reference be something #/definitions/Currencies in {"Currency":{"type":"string","enum":["USD","ETH","BTC"]}}`,
    );
  });

  it("Missing definition for reference in properties", () => {
    expect(() => {
      const schema = {
        type: "object",
        properties: {
          test: {
            $ref: "#/definitions/Currencies",
          },
        },
        definitions: {
          Currency: {
            type: "string",
            enum: ["USD", "ETH", "BTC"],
          },
        },
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
      const test: Type = "test" as never;
    }).toThrow(
      `Expecting the schema reference be something #/definitions/Currencies in {"Currency":{"type":"string","enum":["USD","ETH","BTC"]}}`,
    );
  });

  describe("Top level reference", () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Array_of_JsonRpcResponse",
      $ref: "#/definitions/Currency",
      definitions: {
        Currency: {
          type: "string",
          enum: ["USD", "ETH", "BTC"],
        },
      },
    } as const;
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;

    it("valid", () => {
      const value: Type = "USD";
      matcher.unsafeCast(value);
    });
  });
  describe("Top level all of", () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Array_of_JsonRpcResponse",
      allOf: [{ $ref: "#/definitions/Currency" }],
      definitions: {
        Currency: {
          type: "string",
          enum: ["USD", "ETH", "BTC"],
        },
      },
    } as const;
    const matcher = asSchemaMatcher(schema);
    type Type = typeof matcher._TYPE;

    it("valid", () => {
      const value: Type = "USD";
      matcher.unsafeCast(value);
    });
    it("should fail", () => {
      expect(() => {
        // @ts-expect-error
        const input: Type = "BadCurrency";
        matcher.unsafeCast(input);
      }).toThrow(
        `Failed type: Or<Literal<"USD">,...>("BadCurrency") given input "BadCurrency"`,
      );
    });
  });
  it("definitions not an object", () => {
    expect(() => {
      const schema = {
        type: "array",
        items: {
          $ref: "#/definitions/Currency",
        },
        definitions: true,
      } as const;
      const matcher = asSchemaMatcher(schema);
    }).toThrow(`Expecting some definitions`);
  });
  describe("Complicated Schema", () => {
    const definitions = complicatedDefinitions;
    it("Simple invalidation", () => {
      const schema = {
        type: "array",
        items: {
          $ref: "#/definitions/Currency",
        },
        definitions,
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
      expect(() => {
        const valid: Type = ["ETH"];
        matcher.unsafeCast(valid);
      }).not.toThrow();
      expect(() => {
        // @ts-expect-error
        const input: Type = ["Fun"];
        expect(matcher.unsafeCast(input));
      }).toThrow(
        `Failed type: [0]Or<Literal<"USD">,...>("Fun") given input ["Fun"]`,
      );
    });
    it("Reference Disjoint", () => {
      const schema = {
        type: "array",
        items: {
          $ref: "#/definitions/Result_of_QuoteResponse_or_String",
        },
        definitions,
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
      expect(() => {
        const valid: Type = [
          { Err: "Test" },
          {
            Ok: {
              request_id: "string",
              price: "string",
              size: 5,
              expiration_time: "string",
            },
          },
        ];
        matcher.unsafeCast(valid);
      }).not.toThrow();
      expect(() => {
        // @ts-expect-error
        const input: Type = ["Fun"];
        expect(matcher.unsafeCast(input));
      }).toThrow(
        `Failed type: [0]Or<Concat<Concat<object,Shape<{Ok:any}>>,Partial<{Ok:Concat<Concat<object,Shape<{expiration_time:any,price:any,request_id:any,size:any}>>,Partial<{expiration_time:string,price:string,request_id:string,size:number}>>}>>,...>("Fun") given input ["Fun"]`,
      );
    });
    it("Reference Disjoint array", () => {
      const schema = {
        type: "array",
        items: [
          {
            $ref: "#/definitions/Result_of_QuoteResponse_or_String",
          },
        ],
        definitions,
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
      expect(() => {
        const valid: Type = [
          { Err: "Test" },
          {
            Ok: {
              request_id: "string",
              price: "string",
              size: 5,
              expiration_time: "string",
            },
          },
        ];
        matcher.unsafeCast(valid);
      }).not.toThrow();
      expect(() => {
        // @ts-expect-error
        const input: Type = ["wrongRequest"];
        expect(matcher.unsafeCast(input));
      }).toThrow(
        `Failed type: [0]Or<Concat<Concat<object,Shape<{Ok:any}>>,Partial<{Ok:Concat<Concat<object,Shape<{expiration_time:any,price:any,request_id:any,size:any}>>,Partial<{expiration_time:string,price:string,request_id:string,size:number}>>}>>,...>("wrongRequest") given input ["wrongRequest"]`,
      );
    });
    it("Full shape", () => {
      const schema = {
        type: "array",
        items: {
          $ref: "#/definitions/JsonRpcResponse",
        },
        definitions,
      } as const;
      const matcher = asSchemaMatcher(schema);
      type Type = typeof matcher._TYPE;
      expect(() => {
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
        matcher.unsafeCast(valid);
      }).not.toThrow();
      expect(() => {
        // @ts-expect-error
        const input: Type = ["Fun"];
        expect(matcher.unsafeCast(input));
      }).toThrow(`Failed type: [0]object("Fun") given input ["Fun"]`);
    });
  });
});

describe("any of types", () => {
  const schema = {
    anyOf: [{ enum: ["a"] }, { enum: ["b"] }],
  } as const;
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  it("Testing valid a", () => {
    const input: Type = "a";
    matcher.unsafeCast(input);
  });
  it("Testing valid b", () => {
    const input: Type = "b";
    matcher.unsafeCast(input);
  });
  it("Testing invalid", () => {
    // @ts-expect-error
    const input: Type = "c";

    expect(() => matcher.unsafeCast(input)).toThrow(
      `Failed type: Or<Literal<"a">,...>("c") given input "c"`,
    );
  });
});

describe("all of types", () => {
  const schema = {
    allOf: [
      { type: "object", properties: { a: { enum: ["a"] } }, required: ["a"] },
      { type: "object", properties: { b: { enum: ["b"] } }, required: ["b"] },
    ],
  } as const;
  const matcher = asSchemaMatcher(schema);
  type Type = typeof matcher._TYPE;
  it("Testing valid", () => {
    const input: Type = { a: "a", b: "b" };
    matcher.unsafeCast(input);
  });
  it("Testing invalid partial", () => {
    // @ts-expect-error
    const input: Type = { a: "a" };
    expect(() => matcher.unsafeCast(input)).toThrow(
      `Failed type: ["b"]Shape<{b:any}>("missingProperty") given input {"a":"a"}`,
    );
  });
  it("Testing invalid", () => {
    // @ts-expect-error
    const input: Type = { a: "a", b: "e" };

    expect(() => matcher.unsafeCast(input)).toThrow(
      `Failed type: ["b"]Literal<"b">("e") given input {"a":"a","b":"e"}`,
    );
  });
});

describe("enum types", () => {
  const testSchema = {
    type: ["string"],
    enum: ["red", "amber", "green"],
  } as const;
  const testMatcher = asSchemaMatcher(testSchema);
  type TestMatcher = typeof testMatcher._TYPE;
  it("valid string", () => {
    const input: TestMatcher = "red";
    testMatcher.unsafeCast(input);
  });
  it("invalid string", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: Type = "calculator";
      testMatcher.unsafeCast(invalid);
    }).toThrow(
      `Failed type: Or<Literal<"red">,...>("calculator") given input "calculator"`,
    );
  });
});

describe("https://json-schema.org/learn/getting-started-step-by-step.html", () => {
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
      errors: {
        type: ["null", "string"],
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
    required: ["productId", "productName", "price", "errors"],
  } as const;

  const matchTestSchema = asSchemaMatcher(testSchema);
  type TestSchema = typeof matchTestSchema._TYPE;
  const validShape: TestSchema = {
    errors: null,
    productId: 0,
    price: 0.4,
    productName: "test",
    tags: ["a"],
    extras: ["string", 4],
    isProduct: false,
    dimensions: {
      length: 7.0,
      width: 12.0,
      height: 9.5,
    },
  };

  it("throws for missing requireds", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = {};
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["productId"]Shape<{productId:any,productName:any,price:any,errors:any}>("missingProperty") given input {}`,
    );
  });
  it("throws for invalid integer", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, productId: "0" };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["productId"]number("0") given input {"errors":null,"productId":"0","price":0.4,"productName":"test","tags":["a"],"extras":["string",4],"isProduct":false,"dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid number", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, price: "invalid" };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["price"]number("invalid") given input {"errors":null,"productId":0,"price":"invalid","productName":"test","tags":["a"],"extras":["string",4],"isProduct":false,"dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid string", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, productName: 0 };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["productName"]string(0) given input {"errors":null,"productId":0,"price":0.4,"productName":0,"tags":["a"],"extras":["string",4],"isProduct":false,"dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid array value", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, tags: [0] };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["tags"][0]string(0) given input {"errors":null,"productId":0,"price":0.4,"productName":"test","tags":[0],"extras":["string",4],"isProduct":false,"dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid array", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, extras: "invalid" };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["extras"]ArrayOf<any>("invalid") given input {"errors":null,"productId":0,"price":0.4,"productName":"test","tags":["a"],"extras":"invalid","isProduct":false,"dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid boolean", () => {
    expect(() => {
      // @ts-expect-error
      const invalid: TestSchema = { ...validShape, isProduct: "false" };
      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["isProduct"]boolean("false") given input {"errors":null,"productId":0,"price":0.4,"productName":"test","tags":["a"],"extras":["string",4],"isProduct":"false","dimensions":{"length":7,"width":12,"height":9.5}}`,
    );
  });

  it("throws for invalid nested", () => {
    expect(() => {
      const invalid: TestSchema = {
        ...validShape,
        // @ts-expect-error
        dimensions: {
          width: 12.0,
          height: 9.5,
        },
      };

      matchTestSchema.unsafeCast(invalid);
    }).toThrow(
      `Failed type: ["dimensions"]["length"]Shape<{length:any,width:any,height:any}>("missingProperty") given input {"errors":null,"productId":0,"price":0.4,"productName":"test","tags":["a"],"extras":["string",4],"isProduct":false,"dimensions":{"width":12,"height":9.5}}`,
    );
  });

  it("Will not fail for a valid shape", () => {
    const testSchema: TestSchema = matchTestSchema.unsafeCast(validShape);
  });
});

it("Should be able to find type from partial", () => {
  const schema = {
    type: "object",
    properties: {
      a: {
        type: "integer",
      },
    },
    required: [],
  } as const;

  const matcher = asSchemaMatcher(schema);
  isType<Parser<unknown, { a?: number }>>(matcher);
  const testedValue = matcher.unsafeCast({ a: 1 });
  isType<{ a?: number }>(testedValue);
  // @ts-expect-error
  isType<{ a: number }>(testedValue);
  // @ts-expect-error
  isType<{ a?: 5 }>(testedValue);
});
