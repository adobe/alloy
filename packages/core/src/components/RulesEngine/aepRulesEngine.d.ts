/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// @adobe/aep-rules-engine points `types` at a missing `types/index.d.ts`.
// A .d.ts so tsc does not emit it: dist declarations use ./types.js instead.
declare module "@adobe/aep-rules-engine" {
  export interface RulesEngineOptions {
    generateEventHash: (event: Record<string, unknown>) => string;
  }

  /**
   * Returns one consequence list per matching rule; each consequence is a
   * `Consequence` from ./types.ts (ambient modules can't import it).
   */
  export default function RulesEngine(
    ruleset: unknown,
    options?: RulesEngineOptions,
  ): { execute: (context: Record<string, unknown>) => unknown[][] };
}
