import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const banner = "#!/usr/bin/env node";

var rollup_config = defineConfig([
  // ── CLI bundle (executable) ───────────────────────────────────────────────
  // Single minified ESM file with shebang. Used by `bin.valcss` → dist/cli.js
  {
    input: "src/index.ts",
    output: {
      file: "dist/cli.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },

  // ── Library ESM bundle ────────────────────────────────────────────────────
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },

  // ── Library CJS bundle ────────────────────────────────────────────────────
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },

  // ── Type declarations ─────────────────────────────────────────────────────
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
]);

export { rollup_config as default };
