// placeholder until @adobe/alloy-core passes a typecheck.
declare module "@adobe/alloy-core" {
  export function createCustomInstance(
    options: Record<string, unknown>,
    createPlatformServices?: () => unknown,
    coreConfigValidators?: unknown,
    getImsAccessToken?: { getAccessToken: () => Promise<string> },
  ): (commandName: string, options?: Record<string, unknown>) => Promise<any>;

  export function createCoreConfigs(): unknown;

  export function createGetImsAccessToken(options: {
    edgeCredentials: {
      clientId: string;
      clientSecret: string;
      scopes: string[];
      imsHost: string;
    };
  }): { getAccessToken: () => Promise<string> };

  export function consent(options: Record<string, unknown>): unknown;
}
