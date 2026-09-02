// placeholder until @adobe/alloy-core passes a typecheck.
declare module "@adobe/alloy-core" {
  export function createCustomInstance(
    options: Record<string, unknown>,
    createPlatformServices?: () => unknown,
    coreConfigValidators?: unknown,
  ): (commandName: string, options?: Record<string, unknown>) => Promise<any>;

  export function createCoreConfigs(): unknown;

  export function consent(options: Record<string, unknown>): unknown;
}
