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
import sendNetworkRequestFactory from "./network/sendNetworkRequestFactory";
import createConsent from "./consent/createConsent";
import createEvent from "./createEvent";
import createResponse from "./createResponse";
import executeCommandFactory from "./executeCommandFactory";
import componentCreators from "./componentCreators";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./config/createConfig";
import createCoreConfigs from "./config/createCoreConfigs";
import handleErrorFactory from "./handleErrorFactory";
import networkStrategyFactory from "./network/networkStrategyFactory";
import createLogger from "./createLogger";
import createEventManager from "./createEventManager";
import createCookieTransfer from "./createCookieTransfer";
import createConsentRequestPayload from "./edgeNetwork/requestPayloads/createConsentRequestPayload";
import createDataCollectionRequestPayload from "./edgeNetwork/requestPayloads/createDataCollectionRequestPayload";
import sendEdgeNetworkRequestFactory from "./edgeNetwork/sendEdgeNetworkRequestFactory";
import processWarningsAndErrors from "./edgeNetwork/processWarningsAndErrors";
import createConsentState from "./consent/createConsentState";
import awaitConsentFactory from "./consent/awaitConsentFactory";

// eslint-disable-next-line no-underscore-dangle
const instanceNamespaces = window.__alloyNS;

const createNamespacedStorage = storageFactory(window);

const { console } = window;

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
    const networkStrategy = networkStrategyFactory(window, logger);
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
        coreConfigValidators,
        createConfig,
        logger,
        setDebugEnabled,
        setErrorsEnabled
      });
      const cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId: config.orgId,
        apexDomain
      });
      const sendNetworkRequest = sendNetworkRequestFactory({
        logger,
        networkStrategy
      });
      const consentState = createConsentState({
        config
      });
      const sendEdgeNetworkRequest = sendEdgeNetworkRequestFactory({
        config,
        lifecycle,
        cookieTransfer,
        sendNetworkRequest,
        createResponse,
        processWarningsAndErrors
      });
      const awaitConsent = awaitConsentFactory({
        consentState,
        logger
      });
      const consent = createConsent({
        createConsentRequestPayload,
        sendEdgeNetworkRequest,
        consentState,
        awaitConsent
      });
      const eventManager = createEventManager({
        config,
        logger,
        lifecycle,
        consent,
        createEvent,
        createDataCollectionRequestPayload,
        sendEdgeNetworkRequest
      });

      return initializeComponents({
        componentCreators,
        lifecycle,
        componentRegistry,
        getImmediatelyAvailableTools(componentNamespace) {
          return {
            config,
            consent,
            eventManager,
            logger: logController.createComponentLogger(componentNamespace)
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
