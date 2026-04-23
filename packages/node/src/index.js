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
import { createCustomInstance } from "@adobe/alloy-core";

/**
 * @alpha
 *
 * Node.js entrypoint for the Adobe Experience Platform Web SDK.
 *
 * NOT FUNCTIONAL. This package is a scaffold for the Universal JS
 * migration. Importing it currently throws because `@adobe/alloy-core`
 * still references browser globals (`window`, `document`, etc.) at
 * module scope. See packages/browser/UNIVERSAL_JS_MIGRATION.md.
 *
 * Current signature: `createInstance(options)` — forwards to
 * `createCustomInstance` with an empty components array. Core today does
 * not accept any second argument.
 *
 * Anticipated signature drift: the migration plan (UNIVERSAL_JS_MIGRATION.md
 * §"Core entry points") has core entry points growing a second
 * `platformServices` parameter (`network`, `storage`, `cookie`, `runtime`,
 * `legacy`, `globals`). Once that lands, this wrapper will construct and
 * inject node-flavored services and a node context component here. The
 * exported shape (`createInstance(options)`) is expected to stay stable
 * for consumers.
 */
export const createInstance = (options = {}) =>
  createCustomInstance({
    ...options,
    components: [],
  });

export { createCustomInstance };
