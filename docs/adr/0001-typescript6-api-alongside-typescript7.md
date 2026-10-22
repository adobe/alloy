# 0001: Keep the TypeScript 6 API alongside TypeScript 7 for typescript-eslint

**Status:** accepted (2026-10-22)

## Context

The repo builds and type-checks with TypeScript 7 (`tsc`). Linting `.ts` files in core needs typescript-eslint, which requires the TypeScript compiler API. TypeScript 7.0 ships no API, and typescript-eslint refuses to load with it ("typescript-eslint does not support TS 7.0").

## Decision

Follow the TypeScript 7.0 release guidance for running side by side:

- `typescript` is aliased to `@typescript/typescript6` (TS 6 API, `tsc6` binary) for API consumers such as typescript-eslint.
- `@typescript/native` is aliased to `typescript@^7`, which provides the `tsc` binary used by every build and `typecheck` script.

Bundling does not use the TS API at all: Rollup strips types with oxc (`oxc-transform`), Vitest/Vite with its built-in transform.

## Consequences

- `tsc` is TypeScript 7; `import "typescript"` is TypeScript 6.
- Drop the aliases once typescript-eslint supports the TypeScript 7.1+ API.
