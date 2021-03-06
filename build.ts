// ex. scripts/build_npm.ts
import { build } from "https://deno.land/x/dnt/mod.ts";

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./lib",
  shims: {
    // see JS docs for overview and more options
    deno: "dev",
  },
  mappings: {
    "https://deno.land/x/ts_matches@5.1.5/mod.ts": {
      name: "ts-matches",
      version: "^5.1.5",
    },
  },
  package: {
    // package.json properties
    name: "ts-matches-json-schema",
    version: Deno.args[0],
    description:
      "We want to bring in some pattern matching into the typescript land. We want to be able to type guard a whole bunch of conditions and get the type back.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/blu-j/ts-matches-json-schema.git",
    },
    bugs: {
      url: "https://github.com/blu-j/ts-matches-json-schema/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("./README.md", "lib/README.md");
Deno.copyFileSync("./LICENSE", "lib/LICENSE");
