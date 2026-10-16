import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index:            "src/index.ts",
    "security/index": "src/security/index.ts",
    "clients/index":  "src/clients/index.ts",
    "bridge/index":   "src/bridge/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
  target: "es2022",
});
