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

import createInstanceFunction from "./createInstanceFunction.js";
import {
  getApexDomain,
  injectStorage,
  cookieJar,
  isFunction,
  createLoggingCookieJar,
  injectFireReferrerHideableImage,
} from "../utils";
import createLogController from "./createLogController.js";
import createLifecycle from "./createLifecycle.js";
import createComponentRegistry from "./createComponentRegistry.js";
import injectSendNetworkRequest from "./network/injectSendNetworkRequest.js";
import injectExtractEdgeInfo from "./edgeNetwork/injectExtractEdgeInfo.js";
import createConsent from "./consent/createConsent.js";
import createConsentStateMachine from "./consent/createConsentStateMachine.js";
import createEvent from "./createEvent.js";
import injectCreateResponse from "./injectCreateResponse.js";
import injectExecuteCommand from "./injectExecuteCommand.js";
import validateCommandOptions from "./validateCommandOptions.js";
import componentCreators from "./componentCreators.js";
import buildAndValidateConfig from "./buildAndValidateConfig.js";
import initializeComponents from "./initializeComponents.js";
import createConfig from "./config/createConfig.js";
import createCoreConfigs from "./config/createCoreConfigs.js";
import injectHandleError from "./injectHandleError.js";
import injectSendFetchRequest from "./network/requestMethods/injectSendFetchRequest.js";
import injectSendXhrRequest from "./network/requestMethods/injectSendXhrRequest/index.js";
import injectSendBeaconRequest from "./network/requestMethods/injectSendBeaconRequest/index.js";
import createLogger from "./createLogger.js";
import createEventManager from "./createEventManager.js";
import createCookieTransfer from "./createCookieTransfer.js";
import injectShouldTransferCookie from "./injectShouldTransferCookie.js";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
  createGetAssuranceValidationTokenParams,
} from "../utils/request";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest.js";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors.js";
import injectGetLocationHint from "./edgeNetwork/injectGetLocationHint.js";
import isRequestRetryable from "./network/isRequestRetryable.js";
import getRequestRetryDelay from "./network/getRequestRetryDelay.js";
import injectApplyResponse from "./edgeNetwork/injectApplyResponse.js";

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
const getAssuranceValidationTokenParams =
  createGetAssuranceValidationTokenParams({ window, createNamespacedStorage });

export const createExecuteCommand = ({
  instanceName,
  logController: { setDebugEnabled, logger, createComponentLogger },
}) => {
  const componentRegistry = createComponentRegistry();
  const lifecycle = createLifecycle(componentRegistry);

  const setDebugCommand = (options) => {
    setDebugEnabled(options.enabled, { fromConfig: false });
  };

  const loggingCookieJar = createLoggingCookieJar({ logger, cookieJar });
  const configureCommand = (options) => {
    const config = buildAndValidateConfig({
      options,
      componentCreators,
      coreConfigValidators,
      createConfig,
      logger,
      setDebugEnabled,
    });
    const { orgId, targetMigrationEnabled } = config;
    const shouldTransferCookie = injectShouldTransferCookie({
      orgId,
      targetMigrationEnabled,
    });
    const cookieTransfer = createCookieTransfer({
      cookieJar: loggingCookieJar,
      shouldTransferCookie,
      apexDomain,
      dateProvider: () => new Date(),
    });
    const sendBeaconRequest = isFunction(navigator.sendBeacon)
      ? injectSendBeaconRequest({
          // Without the bind(), the browser will complain about an
          // illegal invocation.
          sendBeacon: navigator.sendBeacon.bind(navigator),
          sendFetchRequest,
          logger,
        })
      : sendFetchRequest;
    const sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendFetchRequest,
      sendBeaconRequest,
      isRequestRetryable,
      getRequestRetryDelay,
    });
    const processWarningsAndErrors = injectProcessWarningsAndErrors({
      logger,
    });
    const extractEdgeInfo = injectExtractEdgeInfo({ logger });
    const createResponse = injectCreateResponse({ extractEdgeInfo });
    const getLocationHint = injectGetLocationHint({ orgId, cookieJar });
    const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
      config,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors,
      getLocationHint,
      getAssuranceValidationTokenParams,
    });

    const applyResponse = injectApplyResponse({
      lifecycle,
      cookieTransfer,
      createResponse,
      processWarningsAndErrors,
    });

    const generalConsentState = createConsentStateMachine({ logger });
    const consent = createConsent({
      generalConsentState,
      logger,
    });
    const eventManager = createEventManager({
      config,
      logger,
      lifecycle,
      consent,
      createEvent,
      createDataCollectionRequestPayload,
      createDataCollectionRequest,
      sendEdgeNetworkRequest,
      applyResponse,
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
            logger: componentLogger,
          }),
          createNamespacedStorage,
          apexDomain,
        };
      },
    });
  };

  const handleError = injectHandleError({
    errorPrefix: `[${instanceName}]`,
    logger,
  });

  const executeCommand = injectExecuteCommand({
    logger,
    configureCommand,
    setDebugCommand,
    handleError,
    validateCommandOptions,
  });
  return executeCommand;
};

export default () => {
  // eslint-disable-next-line no-underscore-dangle
  const instanceNames = window.__alloyNS;

  if (instanceNames) {
    instanceNames.forEach((instanceName) => {
      const logController = createLogController({
        console,
        locationSearch: window.location.search,
        createLogger,
        instanceName,
        createNamespacedStorage,
        getMonitors,
      });

      const executeCommand = createExecuteCommand({
        instanceName,
        logController,
      });
      const instance = createInstanceFunction(executeCommand);

      const queue = window[instanceName].q;
      queue.push = instance;
      logController.logger.logOnInstanceCreated({ instance });
      queue.forEach(instance);
    });
  }
};
