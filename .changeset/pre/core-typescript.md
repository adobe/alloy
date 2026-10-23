---
"@adobe/alloy-core": minor
---

`@adobe/alloy-core` is now written in TypeScript and ships typed declarations for its public entry, services, core contracts and built-in components. Runtime behavior is unchanged: the browser bundles are byte-identical. A few public types are stricter, so TypeScript consumers may need small changes:

- `createCustomInstance` now accepts only component creators (`ComponentCreator[]`) for `components`, and its options are typed (`CreateCustomInstanceOptions`, `CreateInstanceOptions`). The instance still returns `Promise<any>`, and its type is exported as `AlloyInstance`.
- `Response.getPayloadsByType` is generic (`getPayloadsByType<T>(type)`), so custom `Response` implementations must match the new signature.
- `Component` and `ComponentCreator` are generic, so a custom component can type the tools, command options and lifecycle payloads it receives.
