/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createInstance from "./createInstance";
import storageFactory from "../utils/storageFactory";
import initializeComponentsFactory from "./initializeComponentsFactory";

import createLogger from "./createLogger";
import createCookie from "./createCookie";
import createLogController from "./createLogController";

import createDataCollector from "../components/DataCollector";
import createIdentity from "../components/Identity";
import createAudiences from "../components/Audiences";
// import createPersonalization from "../components/Personalization";
import createContext from "../components/Context";
import createStitch from "../components/Stitch";
import createLibraryInfo from "../components/LibraryInfo";

// TODO: Register the Components here statically for now. They might be registered differently.
// TODO: Figure out how sub-components will be made available/registered
const componentCreators = [
  createDataCollector,
  createIdentity,
  createAudiences,
  // createPersonalization,
  createContext,
  createStitch,
  createLibraryInfo
];

// eslint-disable-next-line no-underscore-dangle
const namespaces = window.__alloyNS;

const storage = storageFactory(window);

if (namespaces) {
  namespaces.forEach(namespace => {
    const logController = createLogController(namespace, storage);
    const logger = createLogger(window, logController, `[${namespace}]`);

    const initializeComponents = initializeComponentsFactory(
      componentCreators,
      logger,
      storage,
      createCookie
    );

    const instance = createInstance(
      namespace,
      initializeComponents,
      logController,
      logger,
      window
    );

    const queue = window[namespace].q;
    queue.push = instance;
    queue.forEach(instance);
  });
}
