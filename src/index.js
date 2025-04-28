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

/** @import { AlloyMonitor } from './types.js' */

import { createExecuteCommand } from "./core/index.js";
import createLogger from "./core/createLogger.js";
import createLogController from "./core/createLogController.js";
import { injectStorage } from "./utils/index.js";
import {
  arrayOf,
  objectOf,
  string,
  callback,
} from "./utils/validation/index.js";
import getMonitors from "./core/getMonitors.js";
import * as optionalComponents from "./core/componentCreators.js";

const { console } = window;
const createNamespacedStorage = injectStorage(window);

/**
 * Creates a custom Alloy instance which can reduce the library size and increase performance.
 *
 * @type {(options: Object) => Function}
 * @param {Object} [options] - Configuration options for the instance.
 * @param {string} [options.name=alloy] - The name of the instance.
 * @param {Array<AlloyMonitor>} [options.monitors] - Monitors for the instance.
 * @param {Array<Function>} [options.components] - Components for the instance.
 * @returns {(commandName: string, options?: Object) => Promise<any>} A callable Alloy instance.
 *
 * @see {@link https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/install/create-custom-build} for more details.
 */
export const createCustomInstance = (options = {}) => {
  const eventOptionsValidator = objectOf({
    name: string().default("alloy"),
    monitors: arrayOf(objectOf({})).default([]),
    components: arrayOf(callback()),
  }).noUnknownFields();

  const { name, monitors, components } = eventOptionsValidator(options);

  const logController = createLogController({
    console,
    locationSearch: window.location.search,
    createLogger,
    instanceName: name,
    createNamespacedStorage,
    getMonitors: getMonitors.bind(null, monitors),
  });

  const instance = createExecuteCommand({
    instanceName: name,
    logController,
    components,
  });
  logController.logger.logOnInstanceCreated({ instance });

  return instance;
};

/**
 * Creates a new Alloy instance.
 *
 * @type {(options?: Object) => Function}
 * @param {Object} [options] - Configuration options for the instance.
 * @param {string} [options.name=alloy] - The name of the instance.
 * @param {Array<AlloyMonitor>} [options.monitors] - (Optional) Monitors for the instance.
 * @returns {(commandName: string, options?: Object) => Promise<any>} A callable Alloy instance.
 *
 * @example
 * const alloy = createInstance({ name: "myInstance" });
 * alloy("configure", { datastreamId: "myDatastreamId", orgId: "myOrgId" });
 *
 * @see {@link https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/install/npm} for more details.
 */
export const createInstance = (options = {}) => {
  const eventOptionsValidator = objectOf({
    name: string().default("alloy"),
    monitors: arrayOf(objectOf({})).default([]),
  }).noUnknownFields();

  const { name, monitors } = eventOptionsValidator(options);

  return createCustomInstance({
    name,
    monitors,
    components: Object.values(optionalComponents),
  });
};

export { optionalComponents as components };
