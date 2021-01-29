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

import { createExecuteCommand } from "./core";
import createLogger from "./core/createLogger";
import createLogController from "./core/createLogController";
import { injectStorage } from "./utils";

const { console } = window;
const createNamespacedStorage = injectStorage(window);
// set this up as a function so that monitors can be added at anytime
// eslint-disable-next-line no-underscore-dangle
const defaultGetMonitors = () => window.__alloyMonitors || [];

// eslint-disable-next-line import/prefer-default-export
export const createInstance = ({
  instanceName,
  getMonitors = defaultGetMonitors
}) => {
  const logController = createLogController({
    console,
    locationSearch: window.location.search,
    createLogger,
    instanceName,
    createNamespacedStorage,
    getMonitors
  });
  const instance = createExecuteCommand({ instanceName, logController });
  logController.logger.logOnInstanceCreated({ instance });
  return instance;
};
