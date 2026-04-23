// placeholder until @adobe/alloy-core passes a typecheck.
declare module "@adobe/alloy-core" {
  export function createCustomInstance(
    options: Record<string, unknown>,
  ): unknown;
}
