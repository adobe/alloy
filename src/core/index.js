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

import instanceFactory from "./instanceFactory";
import { getApexDomain, storageFactory, cookieJar } from "../utils";
import createLogController from "./createLogController";
import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import createNetwork from "./network/createNetwork";
import createOptIn from "./createOptIn";
import createEvent from "./createEvent";
import createResponse from "./createResponse";
import executeCommandFactory from "./executeCommandFactory";
import componentCreators from "./componentCreators";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./config/createConfig";
import createConfigValidator from "./config/createValidator";
import createCoreConfigs from "./config/createCoreConfigs";
import handleErrorFactory from "./handleErrorFactory";
import createNetworkStrategy from "./network/createNetworkStrategy";
import createLogger from "./createLogger";
import createEventManager from "./createEventManager";
import createOrgNamespacedCookieName from "./createOrgNamespacedCookieName";
import createCookieTransfer from "./createCookieTransfer";

// eslint-disable-next-line no-underscore-dangle
const instanceNamespaces = window.__alloyNS;

const createNamespacedStorage = storageFactory(window);

let console;

// #if _REACTOR
// When running within the Reactor extension, we want logging to be
// toggled when Reactor logging is toggled. The easiest way to do
// this is to pipe our log messages through the Reactor logger.
console = turbine.logger;
// #else
({ console } = window);
// #endif

const coreConfigValidators = createCoreConfigs();
const apexDomain = getApexDomain(window, cookieJar);

if (instanceNamespaces) {
  instanceNamespaces.forEach(instanceNamespace => {
    const logController = createLogController({
      console,
      locationSearch: window.location.search,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const { setDebugEnabled, logger } = logController;
    const componentRegistry = createComponentRegistry();
    const lifecycle = createLifecycle(componentRegistry);
    const networkStrategy = createNetworkStrategy(window, logger);
    let errorsEnabled = true;
    const getErrorsEnabled = () => {
      return errorsEnabled;
    };
    const setErrorsEnabled = value => {
      errorsEnabled = value;
    };

    const debugCommand = options => {
      setDebugEnabled(options.enabled, { fromConfig: false });
    };

    const configureCommand = options => {
      const config = buildAndValidateConfig({
        options,
        componentCreators,
        createConfig,
        createConfigValidator,
        coreConfigValidators,
        logger,
        setDebugEnabled,
        setErrorsEnabled
      });
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      const cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId: config.orgId,
        apexDomain
      });
      const network = createNetwork({
        config,
        logger,
        networkStrategy
      });
      const eventManager = createEventManager({
        createEvent,
        createResponse,
        optIn,
        lifecycle,
        cookieTransfer,
        network,
        config,
        logger
      });

      return initializeComponents({
        componentCreators,
        lifecycle,
        componentRegistry,
        getImmediatelyAvailableTools(componentAbbreviation) {
          return {
            config,
            optIn,
            network,
            eventManager,
            logger: logController.createComponentLogger(componentAbbreviation)
          };
        }
      });
    };

    const handleError = handleErrorFactory({
      instanceNamespace,
      getErrorsEnabled,
      logger
    });

    const executeCommand = executeCommandFactory({
      logger,
      configureCommand,
      debugCommand,
      handleError
    });

    const instance = instanceFactory(executeCommand);

    const queue = window[instanceNamespace].q;
    queue.push = instance;
    queue.forEach(instance);
  });
}
