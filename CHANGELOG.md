# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and this changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.1.0] - 2026-06-27

### Added

- React and Next.js support via `className` extraction from JSX and TSX files.
- Dynamic project scanning with grouped glob patterns like `**/*.{html,js,jsx,ts,tsx,css,scss,sass,less}`.
- Built-in ignored directories for broad scans: `node_modules`, `dist`, `.git`, `.next`, `coverage`, `build`, and `out`.
- Style file support for `.css`, `.scss`, `.sass`, and `.less`.
- `@apply` expansion support in style files, including `@apply mx-auto;`, `@apply mx-auto !important;`, and `@apply !mx-auto;`.
- Test coverage for React/Next extraction, grouped file resolution, and `@apply`.

### Changed

- Default generated config now scans markup, script, and style files with a single dynamic glob instead of a long static path list.
- `valcss init` templates now include React/Next-friendly scanning and sample custom utilities.
- Config loading now supports `valcss.config.cjs`, `valcss.config.mjs`, `valcss.config.js`, `valcss.config.ts`, and `valcss.config.json`.
- Utility coverage expanded with more Tailwind-style spacing, sizing, gap, radius, grid, and negative utility support.

### Fixed

- Infinite watch-loop behavior caused by rewriting HTML targets in link injection mode even when no HTML changed.
- ESM/CommonJS config loading issues in projects using `"type": "module"`.
- Missing `tslib` declaration required by `@rollup/plugin-typescript` during fresh installs and CI builds.
- Sample config/docs mismatch that caused custom utilities like `flex-center` to warn as invalid in local examples.
- Direct utility parsing regressions around exact classes such as `absolute`, `relative`, and `block`.

---

## [0.0.2] - 2025-05-17

### Breaking Changes

- **Full rewrite in TypeScript.** All source files migrated from `.js` to `.ts`. Consumers importing internal paths must update to the new structure.
- **Build system replaced.** `build-terser.js` removed. Build is now handled by Rollup (`rollup.config.ts`). Output paths have changed:
  - CLI entry: `dist/cli.js` (was `dist/valcss.js`)
  - Library ESM: `dist/index.js`
  - Library CJS: `dist/index.cjs`
  - Type declarations: `dist/index.d.ts`
- **Zero runtime dependencies.** `chokidar` and `glob` removed from `dependencies`. Both replaced with Node.js built-in APIs (`fs.watch`, `fs.readdirSync`). Consumers no longer install transitive packages.
- **`valcss.config.js` format unchanged** - existing config files remain compatible.

### Added

- **TypeScript source** - entire codebase now written in strict TypeScript (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`).
- **`src/types/index.ts`** - shared type definitions: `ValCSSConfig`, `InjectConfig`, `PluginFn`, `StyleRule`, `ParsedClass`, `UtilityEntry`, `BreakpointMap`, `InjectCSSOptions`, and more.
- **Dual CJS + ESM output** - library consumers can use either `import` (ESM) or `require` (CJS). CLI binary remains ESM with shebang injected by Rollup.
- **`rollup.config.ts`** - four build targets: CLI, ESM lib, CJS lib, bundled `.d.ts` declarations.
- **`jest.config.ts`** - Jest + `ts-jest` configured for ESM TypeScript testing.
- **`src/__tests__/validators.test.ts`** - initial test suite covering `lengthUnit`, `color`, and `border` validators.
- **`.eslintrc.json`** - ESLint with `@typescript-eslint/recommended` + `recommended-requiring-type-checking` + `prettier` integration.
- **`.prettierrc`** - Prettier config (100-char print width, double quotes, ES5 trailing commas).
- **`.husky/pre-commit`** - runs `lint-staged` on commit.
- **`.husky/pre-push`** - runs `typecheck` + `test` before push.
- **`lint-staged`** - runs `eslint --fix` + `prettier --write` on staged `src/**/*.ts` files only.
- **`@changesets/cli`** - version and changelog management for npm releases. Config at `.changeset/config.json`.
- **`typedoc.json`** - TypeDoc config; `npm run build:docs` generates API docs into `docs/`.
- **`src/utils/fileResolver.ts`** - native glob resolver using `fs.readdirSync` + recursive `walkDir()`. Supports exact paths, `*.ext`, `dir/**/*.ext`, and `**/*.ext` patterns.
- **`npm run clean`** - removes `dist/` cross-platform (no `rm -rf`).
- **`npm run typecheck`** - `tsc --noEmit` for CI type checking without emitting files.
- **`npm run build:docs`** - generates TypeDoc API documentation.
- **`npm run release` / `release:version` / `release:publish`** - changeset-based release workflow.
- **`CHANGELOG.md`** - this file, tracked in published `files`.

### Changed

- **Project structure reorganised:**
  ```
  src/
  |-- index.ts          <- CLI entry (was valcss.js)
  |-- types/index.ts    <- all shared interfaces
  |-- core/             <- stateful runtime modules
  |   |-- config.ts
  |   |-- configCache.ts
  |   |-- cssGenerator.ts
  |   |-- getBreakpointConfig.ts
  |   |-- injector.ts
  |   `-- pluginEngine.ts
  `-- utils/            <- pure/stateless helpers
      |-- constants.ts
      |-- fileResolver.ts
      |-- getHeaderComment.ts
      |-- normalizeCalcExpression.ts
      |-- stripComments.ts
      `-- validators.ts
  ```
- **`validators.ts`** - `regex` map typed `as const`; all validators explicitly typed as `(val: string) => boolean`.
- **`normalizeCalcExpression.ts`** - split into four named exports: `normalizeExpression`, `normalizeCalcExpression`, `normalizeClampExpression`, `normalizeMinMaxExpression`, and `normalizeCSSMath` (handles all math functions in one pass).
- **`pluginEngine.ts`** - added `resetUtilitiesMap()` for safe rebuilds in watch mode; `addUtilities` signature matches the `PluginFn` type.
- **`configCache.ts`** - throws a typed `Error` if `getConfig()` is called before `setConfig()`.
- **`getBreakpointConfig.ts`** - string breakpoint values (e.g. `"990px"`) are coerced to numbers; invalid values warn and fall back to defaults.
- **`index.ts` watch mode** - replaced `chokidar.watch()` with native `fs.watch()`. Handles `rename`/delete events with a 300 ms debounce re-watch. Graceful `SIGINT` shutdown closes all watchers cleanly.
- **`package.json`** - `"type": "module"` added; `"files"` now includes `CHANGELOG.md`; `engines.node` set to `>=18.0.0`; `exports` map added for subpath resolution.
- **`prepublishOnly`** - now runs `typecheck && lint && test && build` (previously only `build`).
- **TypeScript upgraded** from `^5.4.0` -> `^6.0.3`.

### Removed

- **`chokidar`** from `dependencies` - replaced by `fs.watch`.
- **`glob`** from `dependencies` - replaced by native `resolveFiles()`.
- **`terser`** from `devDependencies` - Rollup handles minification.
- **`build-terser.js`** - deleted; Rollup config replaces it entirely.
- **`scripts/post-build.js`** - deleted; shebang injection handled by Rollup `banner` option.
- **`tsup`** and **`tsx`** from `devDependencies` - replaced by Rollup + `ts-node`.

### Fixed

- `configCache.ts` - module previously used `export` (ESM) but was loaded via `require()` (CJS), causing silent failures. Resolved by aligning the full project to ESM (`"type": "module"`).
- `cssGenerator.ts` - all regex `.match()` results now null-checked before destructuring.
- `index.ts` - `args[i + 1]` for `--output` now guarded with `?? null` to satisfy `noUncheckedIndexedAccess`.

---

## [0.0.1] - 2024-01-01

### Added

- Initial release.
- CLI (`valcss`) with `init`, `--watch`, `--dry-run`, `--output`, `--help` commands.
- Utility class extraction from HTML files via `class="..."` attribute scanning.
- Built-in utility support: spacing (`p`, `m`, `px`, `py`, ...), sizing (`w`, `h`, `max-w`, ...), typography (`text`, `font`, `lh`), colour (`bg`, `text`), layout (`flex`, `grid`, `absolute`, ...), borders, opacity, z-index, and inset utilities.
- Arbitrary value syntax: `p-[10px]`, `text-[#ff0000]`, `w-[calc(100%-2rem)]`.
- Responsive breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`, `xxl:`, with `max-` variants (`max-md:`, `max-lg:`, ...).
- Pseudo-class variants: `hover:`, `focus:`, `active:`, `disabled:`, and more.
- `!` important modifier: `!p-[10px]`.
- Plugin API via `valcss.config.js` - register custom utility classes with `addUtilities()`.
- User-configurable breakpoints in config.
- CSS injection modes: `"link"` (writes to output file) and `"inline"` (injects `<style>` into HTML).
- Header comment with timestamp written to generated CSS.
- `calc()`, `clamp()`, `min()`, `max()` expression normalisation.

---

[Unreleased]: https://github.com/hardik-143/valcss/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/hardik-143/valcss/compare/v0.0.2...v1.1.0
[0.0.2]: https://github.com/hardik-143/valcss/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/hardik-143/valcss/releases/tag/v0.0.1
