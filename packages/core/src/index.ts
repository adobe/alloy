/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// This file is used to rollup the code into an ES module version to be used by other npm projects
// like the launch extension. Everything that is exported here can be used independently by other
// npm projects.

import { createExecuteCommand } from "./core/index.js";
import {
  arrayOf,
  objectOf,
  string,
  callback,
} from "./utils/validation/index.js";
import * as optionalComponents from "./core/componentCreators.js";
import type { AlloyMonitor, ComponentCreator } from "./core/types.js";
import type { PlatformServices } from "./services/index.js";
import type { ExecuteCommand } from "./core/injectExecuteCommand.js";
import type createCoreConfigs from "./core/config/createCoreConfigs.js";
import type createGetImsAccessToken from "./core/edgeNetwork/injectGetImsAccessToken.js";

export type CreatePlatformServices = () => PlatformServices;

export interface CreateInstanceOptions {
  name?: string;
  monitors?: AlloyMonitor[];
}

export interface CreateCustomInstanceOptions extends CreateInstanceOptions {
  components?: ComponentCreator[];
}

/**
 * Creates a fresh, independent scope for tracking which orgId/datastreamId
 * values have been configured, for use as `createCustomInstance`'s third
 * argument. See that function's documentation for when you'd want one.
 */
export { default as createCoreConfigs } from "./core/config/createCoreConfigs.js";

/**
 * Creates an IMS access token getter for the authenticated Edge Network
 * Server API (v2) — exchanges `edgeCredentials` for a token, caching it
 * until shortly before it expires. Pass the same instance into every
 * `createCustomInstance` call that reconfigures against a long-lived
 * process (e.g. Node's `forRequest()`) as the 4th argument, or every call
 * re-authenticates with IMS from scratch. See that function's
 * documentation for details.
 */
export { default as createGetImsAccessToken } from "./core/edgeNetwork/injectGetImsAccessToken.js";

/**
 * The Consent component creator, exported individually (rather than only
 * available bundled into `createInstance`'s full component set) so runtimes
 * like `@adobe/alloy-node` can opt into it without importing core's deep
 * internal paths directly.
 */
export { default as consent } from "./components/Consent/index.js";

/**
 * Creates a custom Alloy instance which can reduce the library size and increase performance.
 *
 * @param [options] - Configuration options for the instance.
 * @param [options.name=alloy] - The name of the instance.
 * @param [options.monitors] - Monitors for the instance.
 * @param [options.components] - Components for the instance.
 * @param createPlatformServices
 * @param [coreConfigValidators]
 * Tracks which orgId/datastreamId values have already been configured, to
 * catch accidentally configuring two instances with the same one. Shared by
 * default for the module's lifetime (matches "configured once per page
 * load," since a page load resets module state); pass a fresh instance per
 * call if that assumption doesn't hold for your runtime (e.g. one Node
 * process handling many requests).
 * @param [getImsAccessToken]
 * Only relevant when `edgeCredentials` is configured — see
 * `createGetImsAccessToken` above.
 * @returns A callable Alloy instance.
 *
 * @see {@link https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/install/create-custom-build} for more details.
 */
export const createCustomInstance = (
  options: CreateCustomInstanceOptions = {},
  // Optional for callers, but createExecuteCommand calls it right away, so a
  // missing value fails at runtime exactly as before. The cast keeps the
  // `= undefined` default and the shorthand property in the emitted code.
  createPlatformServices = undefined as unknown as CreatePlatformServices,
  coreConfigValidators:
    | ReturnType<typeof createCoreConfigs>
    | undefined = undefined,
  getImsAccessToken:
    | ReturnType<typeof createGetImsAccessToken>
    | undefined = undefined,
): ExecuteCommand => {
  const eventOptionsValidator = objectOf({
    name: string().default("alloy"),
    monitors: arrayOf(objectOf({})).default([]),
    components: arrayOf(callback()),
  }).noUnknownFields();

  // The validator returns `unknown`; the schema above guarantees this shape.
  const { name, monitors, components } = eventOptionsValidator(options) as {
    name: string;
    monitors: AlloyMonitor[];
    components: ComponentCreator[];
  };

  return createExecuteCommand({
    instanceName: name,
    monitors,
    components,
    createPlatformServices,
    coreConfigValidators,
    getImsAccessToken,
  });
};

/**
 * Creates a new Alloy instance.
 *
 * @param [options] - Configuration options for the instance.
 * @param [options.name=alloy] - The name of the instance.
 * @param [options.monitors] - (Optional) Monitors for the instance.
 * @param createPlatformServices
 * @returns A callable Alloy instance.
 *
 * @example
 * const alloy = createInstance({ name: "myInstance" });
 * alloy("configure", { datastreamId: "myDatastreamId", orgId: "myOrgId" });
 *
 * @see {@link https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/install/npm} for more details.
 */
export const createInstance = (
  options: CreateInstanceOptions = {},
  // Optional for callers, but createExecuteCommand calls it right away, so a
  // missing value fails at runtime exactly as before. The cast keeps the
  // `= undefined` default and the shorthand property in the emitted code.
  createPlatformServices = undefined as unknown as CreatePlatformServices,
): ExecuteCommand => {
  const eventOptionsValidator = objectOf({
    name: string().default("alloy"),
    monitors: arrayOf(objectOf({})).default([]),
  }).noUnknownFields();

  // The validator returns `unknown`; the schema above guarantees this shape.
  const { name, monitors } = eventOptionsValidator(options) as {
    name: string;
    monitors: AlloyMonitor[];
  };

  return createCustomInstance(
    {
      name,
      monitors,
      components: Object.values(optionalComponents),
    },
    createPlatformServices,
  );
};
