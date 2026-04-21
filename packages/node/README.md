# @adobe/alloy-node

> [!WARNING]
> **Pre-alpha scaffold. Not functional. Do not use.**
>
> This package exists as a placeholder for the Universal JS migration.
> It currently throws on import because `@adobe/alloy-core` still
> references browser globals (`window`, `document`, `navigator`, etc.)
> at module scope.
>
> Once the migration is complete, this package will provide a
> `createInstance` that accepts platform services (network, storage,
> cookie, runtime) and runs in Node.js.
>
> See [`packages/browser/UNIVERSAL_JS_MIGRATION.md`](../browser/UNIVERSAL_JS_MIGRATION.md)
> for the migration plan and progress.

Node.js entrypoint for the Adobe Experience Platform Web SDK.
