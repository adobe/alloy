/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Lets Node run @adobe/alloy-core from source (no build) when code loads it
// natively, bypassing Vite/Rollup (e.g. CommonJS `require` in the reactor
// extension tests, alloyBuilder, the node sandbox). `.js` specifiers fall back
// to `.ts` sources; Node strips the types itself. Usage:
//   node --conditions=alloy-source --import ./scripts/helpers/registerTsFromJsHook.js …
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        error?.code !== "ERR_MODULE_NOT_FOUND" ||
        !specifier.endsWith(".js")
      ) {
        throw error;
      }
      return nextResolve(`${specifier.slice(0, -3)}.ts`, context);
    }
  },
});
