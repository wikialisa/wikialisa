import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index:           "src/index.ts",
    "mt/index":      "src/mt/index.ts",
    "iso20022/index":"src/iso20022/index.ts",
    "security/index":"src/security/index.ts",
    "schemas/index": "src/schemas/index.ts",
    "utils/index":   "src/utils/index.ts",
    "client/index":  "src/client/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
  target: "es2022",
});
