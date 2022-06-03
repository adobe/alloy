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

import createInstanceFunction from "./createInstanceFunction";
import {
  getApexDomain,
  injectStorage,
  cookieJar,
  isFunction,
  injectFireReferrerHideableImage
} from "../utils";
import createLogController from "./createLogController";
import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import injectSendNetworkRequest from "./network/injectSendNetworkRequest";
import injectExtractEdgeInfo from "./edgeNetwork/injectExtractEdgeInfo";
import createConsent from "./consent/createConsent";
import createConsentStateMachine from "./consent/createConsentStateMachine";
import createEvent from "./createEvent";
import injectCreateResponse from "./injectCreateResponse";
import injectExecuteCommand from "./injectExecuteCommand";
import validateCommandOptions from "./validateCommandOptions";
import componentCreators from "./componentCreators";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./config/createConfig";
import createCoreConfigs from "./config/createCoreConfigs";
import injectHandleError from "./injectHandleError";
import injectSendFetchRequest from "./network/requestMethods/injectSendFetchRequest";
import injectSendXhrRequest from "./network/requestMethods/injectSendXhrRequest";
import injectSendBeaconRequest from "./network/requestMethods/injectSendBeaconRequest";
import createLogger from "./createLogger";
import createEventManager from "./createEventManager";
import createCookieTransfer from "./createCookieTransfer";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload
} from "../utils/request";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors";
import isRequestRetryable from "./network/isRequestRetryable";
import getRequestRetryDelay from "./network/getRequestRetryDelay";

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
const fireReferrerHideableImage = injectFireReferrerHideableImage();

export const createExecuteCommand = ({
  instanceName,
  logController: { setDebugEnabled, logger, createComponentLogger }
}) => {
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
    const sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendFetchRequest,
      sendBeaconRequest,
      isRequestRetryable,
      getRequestRetryDelay
    });
    const processWarningsAndErrors = injectProcessWarningsAndErrors({
      logger
    });
    const extractEdgeInfo = injectExtractEdgeInfo({ logger });
    const createResponse = injectCreateResponse({ extractEdgeInfo });
    const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
      config,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors
    });

    const generalConsentState = createConsentStateMachine({ logger });
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
      createDataCollectionRequest,
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
          componentRegistry,
          consent,
          eventManager,
          fireReferrerHideableImage,
          logger: componentLogger,
          lifecycle,
          sendEdgeNetworkRequest,
          handleError: injectHandleError({
            errorPrefix: `[${instanceName}] [${componentName}]`,
            logger: componentLogger
          }),
          createNamespacedStorage
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
  return executeCommand;
};

export default () => {
  // eslint-disable-next-line no-underscore-dangle
  const instanceNames = window.__alloyNS;

  if (instanceNames) {
    instanceNames.forEach(instanceName => {
      const logController = createLogController({
        console,
        locationSearch: window.location.search,
        createLogger,
        instanceName,
        createNamespacedStorage,
        getMonitors
      });

      const executeCommand = createExecuteCommand({
        instanceName,
        logController
      });
      const instance = createInstanceFunction(executeCommand);

      const queue = window[instanceName].q;
      queue.push = instance;
      logController.logger.logOnInstanceCreated({ instance });
      queue.forEach(instance);
    });
  }
};
