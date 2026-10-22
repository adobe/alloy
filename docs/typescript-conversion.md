# Converting `@adobe/alloy-core` to TypeScript

`packages/core/src/utils` was converted first, as a pilot. This recipe covers the
remaining areas: `constants`, `services`, `core` and `components`. Convert one
area (or one component) per change, so each change is small and easy to verify.

## How the build works

- `packages/core/tsconfig.json` uses strict mode with `erasableSyntaxOnly`,
  `allowJs`, `checkJs: false`, `declaration` and `verbatimModuleSyntax`.
  `pnpm --filter @adobe/alloy-core run build` compiles `src` to `dist` (`.js` +
  `.d.ts`). The `prepack` script runs the build.
- Every export subpath has three conditions:
  `{ "alloy-source": "./src/….js", "types": "./dist/….d.ts", "default": "./dist/….js" }`.
  The wildcards `./*.js` and `./*` work the same way.
- Inside the monorepo, all consumers resolve the `alloy-source` condition, so
  core never has to be built first:
  - Vitest uses `vitest.shared.js`.
  - Rollup uses `typeScriptSourcePlugins()` in `packages/browser/rollup.config.js`.
  - The node package uses `customConditions`.
  - The sandbox uses Vite `resolve.conditions`.
  - Plain Node runs with
    `--conditions=alloy-source --import scripts/helpers/registerTsFromJsHook.js`.
- The condition is named `alloy-source` instead of `source` because
  `@react-spectrum/*` also publishes a `source` condition.
- Import specifiers keep the `.js` extension, even when the file is now `.ts`.
  TypeScript (bundler resolution), Vite, the Rollup plugin, the ESLint resolver
  and the Node hook all map `.js` to `.ts`.

## Steps

1. Start a branch or worktree from the integration tip. Run
   `PUPPETEER_SKIP_DOWNLOAD=1 pnpm install --frozen-lockfile`.
2. Record a "before" snapshot: build browser and copy `bundlesize.json`,
   `dist/` and `packages/core/dist` (see Verify). Then run
   `git checkout packages/browser/bundlesize.json`, because the file is tracked.
3. Rename each file with `git mv src/<area>/x.js src/<area>/x.ts`. Keep diffs
   small so `git show -M` still detects the rename.
   - Do **not** change import specifiers. Do **not** change tests.
   - Find code outside core that imports the renamed file by relative path,
     for example `../../core/src/…/x.js`. Tools that skip the `.js`→`.ts`
     mapping will break on these imports. TestCafe functional specs in
     `packages/browser/test/functional` are one example. Run
     `git grep -nE "core/src/<area>/" -- packages sandboxes scripts`. Change each
     hit to a package import (`@adobe/alloy-core/…`) or to the underlying
     dependency.
4. Add types. Change type annotations only. Do not refactor or add code; the
   runtime behavior must stay the same:
   - Replace JSDoc `{Type}` with TypeScript annotations. Keep the JSDoc prose
     (`@param name - text`, `@returns text`).
   - Change `@typedef` to `export type` or `export interface` in the same file.
     Change `types.js` to `types.ts`. Use `import type { … }` for type-only
     imports (`verbatimModuleSyntax` requires it).
   - Do not use enums, namespaces, parameter properties or `import =`
     (`erasableSyntaxOnly`). For enums, use `as const` objects and
     `(typeof X)[keyof typeof X]`.
   - Keep default exports as default exports. Keep exported names unchanged.
   - A dependency without types needs an ambient `*.d.ts` in `src`. The
     compiler does **not** emit it. Add
     `/// <reference path="./x.d.ts" preserve="true" />` to the module that
     re-exports the dependency, so the reference ends up in `dist` (see
     `utils/querystring.ts` and `utils/reactorQueryString.d.ts`).
5. **`any` policy:** prefer precise types, generics, or `unknown` with
   narrowing. Avoid non-null `!` unless the value is provably non-null. Use
   `any` only where a value is intentionally untyped, for example a
   pass-through of the caller's object or an untyped config blob. Put this
   comment directly above the line:
   `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>`.
   An unused disable comment is a lint error.
6. Area-specific notes:
   - **constants:** these are mostly literal objects and strings. Add
     `as const` only where the inferred literal types matter, because it changes
     the emitted `.d.ts` types. Check every relative import from functional
     tests (`legacyCookies.js` and `decisionProvider.js` are imported this way
     today).
   - **services:** the subpath is `./services`. Its `types` entry must resolve
     to `dist/services/index.d.ts`. Convert `index` last, after its members.
   - **core:** factory functions (`createX`/`injectX`) are the main surface.
     Type their dependency objects as interfaces in `core/types.ts`. Reuse the
     `utils/types.ts` interfaces (`Logger`, `CookieJar`, `Storage`, `Event`)
     instead of redefining them.
   - **components:** convert one component directory at a time. Keep
     `components.json` and the component registry untouched. Type
     `createComponent` return values with a shared `Component` interface.
     Each component's `index` must keep its default-export shape, because the
     custom-build tooling (`alloyBuilder`, `scripts/customBuild.spec.js`)
     loads them through the Node hook.
   - **Export paths (`alloy-source`):** a new public subpath must be added to
     `packages/core/package.json` `exports` with all three conditions, in this
     order: `alloy-source` → `src/….js`, `types` → `dist/….d.ts`,
     `default` → `dist/….js`. Keep `alloy-source` first. Without it, monorepo
     consumers resolve `dist` and fail when core is not built. Files covered by
     the wildcards need no change.

## Verify

Run from the repository root:

```sh
pnpm --filter @adobe/alloy-core run typecheck
./node_modules/.bin/eslint "*.{js,cjs,mjs,jsx}" "{sandboxes/*/src,packages/*/{src,test,scripts},scripts}/**/*.{js,cjs,mjs,jsx,ts}"  # 0 errors
pnpm run format:check && pnpm run typecheck
rm -rf packages/core/dist   # proves nothing depends on a built core
pnpm exec vitest run --project=core/unit --project=browser/unit --project=browser/integration \
  --project=reactor-extension/unit --project=reactor-extension/integration \
  --project=node-integration --project=node/unit --project=scripts
(cd packages/browser && pnpm run build) && (cd packages/reactor-extension && pnpm run build)
```

Then compare the build output with the "before" snapshot:

- `alloy.min.js` and `alloyServiceWorker.min.js` must be **byte-identical**.
- In `bundlesize.json`, only the rows for unminified files may change.
- Unminified bundles may differ only in comments and formatting. To check,
  parse both files and compare the ASTs without `start`, `end` and `raw`
  fields, for example with `parseAst` from `rollup/parseAst`. The ASTs must be
  equal.
- Declarations: build core and compare each `.d.ts` export with the snapshot.
  A text diff is not useful, because tsc emit order and format change. Check
  types instead: generate one file that imports both versions and asserts, for
  every export, either strict equality
  (`(<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)`) or
  mutual assignability. Put a `{"type":"module"}` `package.json` next to both
  trees, or `.default` will resolve to the CommonJS namespace. Explain every
  export that is not equal. Expected reasons: `any` became precise, JSDoc
  `Object`/`Function` became real types, or a type was newly exported.
  **Removed** exports are regressions unless they were never real.
- Pack check:
  ```sh
  P=$(mktemp -d); (cd packages/core && pnpm pack --pack-destination $P) && tar -xzf $P/*.tgz -C $P
  ```
  Every path in `exports` must exist. Every `dist/**/*.js` must have a sibling
  `.d.ts`. Type-check a small consumer file against the packed package with
  `--strict --module nodenext`.

## Pilot results (utils)

The pilot was checked against `after-03` (core build added, nothing converted
yet) and against the original JavaScript baseline.

- Tests: 504 files pass. The 3308 tests passed with 20 skipped.
  node-integration is skipped because it needs Edge credentials. Lint reports
  0 errors and the 24 warnings that existed before.
- `alloy.min.js` and the minified service worker are byte-identical to before.
  `alloy.js`, `alloyServiceWorker.js` and `utils/deepAssign.js` have ASTs equal
  to before; only comments, whitespace and quote style changed. In
  `bundlesize.json`, only the unminified rows changed, all smaller.
- Packed tarball: all 6 explicit subpaths and both wildcards resolve. Every
  `dist/**/*.js` has a `.d.ts`.
- Declarations, core `dist/utils` compared with the baseline browser
  `dist/types/core/src/utils` (117 files, 239 exports):
  - 32 exports are identical. 147 are mutually assignable; they differ only by
    `any` becoming `unknown` or a precise type, or by an optional `| undefined`.
  - 60 are intentionally narrower, all `any`/`Object`/`Function` from JSDoc
    becoming real types:
    - type guards: `isString(value: unknown): value is string`
    - generics: `groupBy<T>(arr: T[], keyGetter: (item: T) => string): Record<string, T[]>`
    - DOM types: `selectNodes(...): Element[]` with `context?: ParentNode`
    - `CookieJar` instead of `Object`
    - `stackError` returns `Error`
    - `types.ts`/`request/types.ts`/`validation/types.ts` typedefs became
      interfaces with real member types; for example `Storage.setItem`
      returns `boolean` instead of `void`, which matches the implementation.
  - Some types are newly exported, for example `Deferred`,
    `LoadScriptOptions`, `ParsedDomain`, `CreateRequestOptions<P>`, `Logger`,
    `Event` and `ValidatorContext`.
  - The only export that was removed is `RequestPayload` from
    `request/createRequestParams`. It was a JSDoc typedef artifact; the type
    is still exported from `request/types`.
  - Before this pilot, `querystring.d.ts` lost its type: the ambient
    `reactorQueryString.d.ts` was not emitted, so the default export became an
    implicit `any`. It is now kept through a preserved triple-slash reference.
