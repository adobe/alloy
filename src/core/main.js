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
import {
  getTopLevelCookieDomain,
  memoize,
  storageFactory,
  cookieJar
} from "../utils";
import createCookieProxy from "./createCookieProxy";
import createComponentNamespacedCookieJar from "./createComponentNamespacedCookieJar";
import createLogController from "./createLogController";
import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import createNetwork from "./network/createNetwork";
import createOptIn from "./createOptIn";
import executeCommandFactory from "./executeCommandFactory";
import componentCreators from "./componentCreators";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./createConfig";
import coreConfigValidators from "./configValidators";
import handleErrorFactory from "./handleErrorFactory";
import networkToolFactory from "./tools/networkToolFactory";
import configToolFactory from "./tools/configToolFactory";
import cookieJarToolFactory from "./tools/cookieJarToolFactory";
import enableOptInToolFactory from "./tools/enableOptInToolFactory";
import loggerToolFactory from "./tools/loggerToolFactory";
import createNetworkStrategy from "./network/createNetworkStrategy";
import createLogger from "./createLogger";

// eslint-disable-next-line no-underscore-dangle
const instanceNamespaces = window.__alloyNS;

const createNamespacedStorage = storageFactory(window);
const memoizedGetTopLevelDomain = memoize(getTopLevelCookieDomain);

let console;

// #if _REACTOR
// When running within the Reactor extension, we want logging to be
// toggled when Reactor logging is toggled. The easiest way to do
// this is to pipe our log messages through the Reactor logger.
console = turbine.logger;
// #else
({ console } = window);
// #endif

if (instanceNamespaces) {
  instanceNamespaces.forEach(instanceNamespace => {
    const logController = createLogController({
      console,
      locationSearch: window.location.search,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const { setLogEnabled, logger } = logController;
    const componentRegistry = createComponentRegistry();
    const optIn = createOptIn();
    const lifecycle = createLifecycle(componentRegistry);
    const getTopLevelDomain = () => {
      return memoizedGetTopLevelDomain(window, cookieJar);
    };
    const networkStrategy = createNetworkStrategy(window, logger);
    let errorsEnabled = true;
    const getErrorsEnabled = () => {
      return errorsEnabled;
    };
    const setErrorsEnabled = value => {
      errorsEnabled = value;
    };

    const logCommand = options => {
      setLogEnabled(options.enabled, {
        persist: true,
        highPriority: true
      });
    };

    const configureCommand = options => {
      const config = buildAndValidateConfig({
        options,
        componentCreators,
        createConfig,
        coreConfigValidators,
        logger,
        setLogEnabled,
        setErrorsEnabled
      });
      return initializeComponents({
        config,
        componentCreators,
        lifecycle,
        componentRegistry,
        tools: {
          config: configToolFactory(),
          cookieJar: cookieJarToolFactory(
            createCookieProxy,
            createComponentNamespacedCookieJar,
            getTopLevelDomain
          ),
          enableOptIn: enableOptInToolFactory(optIn),
          logger: loggerToolFactory(logController.createComponentLogger),
          network: networkToolFactory(
            createNetwork,
            lifecycle,
            logger,
            networkStrategy
          )
        },
        optIn
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
      logCommand,
      handleError
    });

    const instance = instanceFactory(executeCommand);

    const queue = window[instanceNamespace].q;
    queue.push = instance;
    queue.forEach(instance);
  });
}
