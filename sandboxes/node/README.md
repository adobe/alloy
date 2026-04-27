# @adobe/alloy-sandbox-node

> [!WARNING]
> **Does not run today.** `@adobe/alloy-node` re-exports from
> `@adobe/alloy-core`, which still references browser globals (`window`,
> `document`, `navigator`, etc.) at module scope. Running `pnpm start`
> currently throws at import. This sandbox exists to prove out the
> consumer API shape and become the first working smoke test once the
> [Universal JS migration](../../packages/browser/UNIVERSAL_JS_MIGRATION.md)
> lands.

Bare-bones Node.js example for `@adobe/alloy-node`. Mirrors the skipped
integration suite in `packages/node/test/integration/nodeConsumer.spec.js`.

## Run

```sh
pnpm install
pnpm --filter @adobe/alloy-sandbox-node start
```
