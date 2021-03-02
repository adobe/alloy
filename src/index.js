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
import { arrayOf, objectOf, string } from "./utils/validation";

const { console } = window;
const createNamespacedStorage = injectStorage(window);

export const createInstance = options => {
  const eventOptionsValidator = objectOf({
    name: string().required(),
    monitors: arrayOf(objectOf({}))
  })
    .noUnknownFields()
    .required();
  const { name, monitors = [] } = eventOptionsValidator(options);

  // this is a function so that window.__alloyMonitors can be set or added to at any any time
  // eslint-disable-next-line no-underscore-dangle
  const getMonitors = () => (window.__alloyMonitors || []).concat(monitors);
  const logController = createLogController({
    console,
    locationSearch: window.location.search,
    createLogger,
    instanceName: name,
    createNamespacedStorage,
    getMonitors
  });
  const instance = createExecuteCommand({ instanceName: name, logController });
  logController.logger.logOnInstanceCreated({ instance });
  return instance;
};
