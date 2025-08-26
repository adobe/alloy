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
  createLoggingCookieJar,
  injectFireReferrerHideableImage,
  injectGetBrowser,
} from "../utils/index";
import createLogController from "./createLogController";
import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import injectSendNetworkRequest from "./network/injectSendNetworkRequest";
import injectExtractEdgeInfo from "./edgeNetwork/injectExtractEdgeInfo";
import createIdentity from "./identity/createIdentity";
import createConsent from "./consent/createConsent";
import createConsentStateMachine from "./consent/createConsentStateMachine";
import createEvent from "./createEvent";
import injectCreateResponse from "./injectCreateResponse";
import injectExecuteCommand from "./injectExecuteCommand";
import validateCommandOptions from "./validateCommandOptions";
import buildAndValidateConfig from "./buildAndValidateConfig";
import initializeComponents from "./initializeComponents";
import createConfig from "./config/createConfig";
import createCoreConfigs from "./config/createCoreConfigs";
import injectHandleError from "./injectHandleError";
import injectSendFetchRequest from "./network/requestMethods/injectSendFetchRequest";
import injectSendBeaconRequest from "./network/requestMethods/injectSendBeaconRequest";
import createLogger from "./createLogger";
import createEventManager from "./createEventManager";
import createCookieTransfer from "./createCookieTransfer";
import injectShouldTransferCookie from "./injectShouldTransferCookie";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
  createGetAssuranceValidationTokenParams,
} from "../utils/request/index";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors";
import injectGetLocationHint from "./edgeNetwork/injectGetLocationHint";
import isRequestRetryable from "./network/isRequestRetryable";
import getRequestRetryDelay from "./network/getRequestRetryDelay";
import injectApplyResponse from "./edgeNetwork/injectApplyResponse";
import getMonitors from "./getMonitors";
import * as requiredComponents from "./requiredComponentCreators";

const createNamespacedStorage = injectStorage(window);

const { console, fetch, navigator } = window;

const coreConfigValidators = createCoreConfigs();
const apexDomain = getApexDomain(window, cookieJar);
const sendFetchRequest = injectSendFetchRequest({ fetch });
const fireReferrerHideableImage = injectFireReferrerHideableImage();
const getAssuranceValidationTokenParams =
  createGetAssuranceValidationTokenParams({ window, createNamespacedStorage });

const getBrowser = injectGetBrowser({ userAgent: window.navigator.userAgent });

export const createExecuteCommand = ({
  instanceName,
  logController: { setDebugEnabled, logger, createComponentLogger },
  components,
}) => {
  const componentRegistry = createComponentRegistry();
  const lifecycle = createLifecycle(componentRegistry);

  const componentCreators = components.concat(
    Object.values(requiredComponents),
  );

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

    const identity = createIdentity({ config, logger, loggingCookieJar });
    identity.initialize();

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
          identity,
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
          getBrowser,
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

export default ({ components }) => {
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
        components,
      });
      const instance = createInstanceFunction(executeCommand);

      const queue = window[instanceName].q;
      queue.push = instance;
      logController.logger.logOnInstanceCreated({ instance });
      queue.forEach(instance);
    });
  }
};
