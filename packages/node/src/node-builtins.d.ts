// Minimal ambient declarations for the Node builtins this package uses,
// scoped to just what's needed — avoids pulling in @types/node wholesale,
// which would conflict with the DOM lib types this package already relies
// on for fetch/Response.
declare module "node:module" {
  export function createRequire(url: string): (id: string) => any;
}
