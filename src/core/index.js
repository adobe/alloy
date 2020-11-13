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
import { getApexDomain, injectStorage, cookieJar, isFunction } from "../utils";
import createLogController from "./createLogController";
import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import injectSendNetworkRequest from "./network/injectSendNetworkRequest";
import createConsent from "./consent/createConsent";
import createConsentStateMachine from "./consent/createConsentStateMachine";
import createEvent from "./createEvent";
import createResponse from "./createResponse";
import injectExecuteCommand from "./injectExecuteCommand";
import validateCommandOptions from "./validateCommandOptions";
import componentCreators from "./componentCreators";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./config/createConfig";
import createCoreConfigs from "./config/createCoreConfigs";
import injectHandleError from "./injectHandleError";
import injectSendFetchRequest from "./network/injectSendFetchRequest";
import injectSendXhrRequest from "./network/injectSendXhrRequest";
import injectSendBeaconRequest from "./network/injectSendBeaconRequest";
import injectNetworkStrategy from "./network/injectNetworkStrategy";
import createLogger from "./createLogger";
import createEventManager from "./createEventManager";
import createCookieTransfer from "./createCookieTransfer";
import createDataCollectionRequestPayload from "./edgeNetwork/requestPayloads/createDataCollectionRequestPayload";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors";
import validateNetworkResponseIsWellFormed from "./edgeNetwork/validateNetworkResponseIsWellFormed";
import isRetryableHttpStatusCode from "./network/isRetryableHttpStatusCode";

export default () => {
  // eslint-disable-next-line no-underscore-dangle
  const instanceNames = window.__alloyNS;

  const createNamespacedStorage = injectStorage(window);

  const { console, fetch, navigator, XMLHttpRequest } = window;

  // set this up as a function so that monitors can be added at anytime
  // eslint-disable-next-line no-underscore-dangle
  const getMonitors = () => window.__alloyMonitors || [];

  const coreConfigValidators = createCoreConfigs();
  const apexDomain = getApexDomain(window, cookieJar);
  const sendFetchRequest = isFunction(fetch)
    ? injectSendFetchRequest({ fetch })
    : injectSendXhrRequest({ XMLHttpRequest });

  if (instanceNames) {
    instanceNames.forEach(instanceName => {
      const {
        setDebugEnabled,
        logger,
        createComponentLogger
      } = createLogController({
        console,
        locationSearch: window.location.search,
        createLogger,
        instanceName,
        createNamespacedStorage,
        getMonitors
      });
      const componentRegistry = createComponentRegistry();
      const lifecycle = createLifecycle(componentRegistry);

      const setDebugCommand = options => {
        setDebugEnabled(options.enabled, { fromConfig: false });
      };

      const configureCommand = options => {
        const config = buildAndValidateConfig({
          options,
          componentCreators,
          coreConfigValidators,
          createConfig,
          logger,
          setDebugEnabled
        });
        const cookieTransfer = createCookieTransfer({
          cookieJar,
          orgId: config.orgId,
          apexDomain
        });
        const sendBeaconRequest = isFunction(navigator.sendBeacon)
          ? injectSendBeaconRequest({
              // Without the bind(), the browser will complain about an
              // illegal invocation.
              sendBeacon: navigator.sendBeacon.bind(navigator),
              sendFetchRequest,
              logger
            })
          : sendFetchRequest;
        const networkStrategy = injectNetworkStrategy({
          sendFetchRequest,
          sendBeaconRequest
        });
        const sendNetworkRequest = injectSendNetworkRequest({
          logger,
          networkStrategy,
          isRetryableHttpStatusCode
        });
        const processWarningsAndErrors = injectProcessWarningsAndErrors({
          logger
        });
        const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
          config,
          lifecycle,
          cookieTransfer,
          sendNetworkRequest,
          createResponse,
          processWarningsAndErrors,
          validateNetworkResponseIsWellFormed
        });

        const generalConsentState = createConsentStateMachine();
        const consent = createConsent({
          generalConsentState,
          logger
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
          getImmediatelyAvailableTools(componentName) {
            const componentLogger = createComponentLogger(componentName);
            return {
              config,
              consent,
              eventManager,
              logger: componentLogger,
              lifecycle,
              sendEdgeNetworkRequest,
              handleError: injectHandleError({
                errorPrefix: `[${instanceName}] [${componentName}]`,
                logger: componentLogger
              })
            };
          }
        });
      };

      const handleError = injectHandleError({
        errorPrefix: `[${instanceName}]`,
        logger
      });

      const executeCommand = injectExecuteCommand({
        logger,
        configureCommand,
        setDebugCommand,
        handleError,
        validateCommandOptions
      });

      const instance = createInstance(executeCommand);

      const queue = window[instanceName].q;
      queue.push = instance;
      logger.logOnInstanceCreated({ instance });
      queue.forEach(instance);
    });
  }
};
