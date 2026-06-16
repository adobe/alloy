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

import {
  getApexDomain,
  createLoggingCookieJar,
  injectGetBrowser,
  queryString,
  stringToBoolean,
} from "../utils/index.js";
import createLogController from "./createLogController.js";
import createLifecycle from "./createLifecycle.js";
import createComponentRegistry from "./createComponentRegistry.js";
import injectSendNetworkRequest from "./network/injectSendNetworkRequest.js";
import injectExtractEdgeInfo from "./edgeNetwork/injectExtractEdgeInfo.js";
import createIdentity from "./identity/createIdentity.js";
import createConsent from "./consent/createConsent.js";
import createConsentStateMachine from "./consent/createConsentStateMachine.js";
import createEvent from "./createEvent.js";
import injectCreateResponse from "./injectCreateResponse.js";
import injectExecuteCommand from "./injectExecuteCommand.js";
import validateCommandOptions from "./validateCommandOptions.js";
import buildAndValidateConfig from "./buildAndValidateConfig.js";
import initializeComponents from "./initializeComponents.js";
import createConfig from "./config/createConfig.js";
import createCoreConfigs from "./config/createCoreConfigs.js";
import injectHandleError from "./injectHandleError.js";
import createLogger from "./createLogger.js";
import createEventManager from "./createEventManager.js";
import createCookieTransfer from "./createCookieTransfer.js";
import injectShouldTransferCookie from "./injectShouldTransferCookie.js";
import debugQueryParam from "../constants/debugQueryParam.js";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
  createGetAssuranceValidationTokenParams,
} from "../utils/request/index.js";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest.js";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors.js";
import injectGetLocationHint from "./edgeNetwork/injectGetLocationHint.js";
import isRequestRetryable from "./network/isRequestRetryable.js";
import getRequestRetryDelay from "./network/getRequestRetryDelay.js";
import injectApplyResponse from "./edgeNetwork/injectApplyResponse.js";
import * as requiredComponents from "./requiredComponentCreators.js";

const coreConfigValidators = createCoreConfigs();

/**
 * @param {Object} params
 * @param {string} params.instanceName
 * @param {Array<import('./types.js').AlloyMonitor>} [params.monitors]
 * @param {Array<Function>} params.components
 * @param {() => import('../services/index.js').PlatformServices} params.createPlatformServices
 */
export const createExecuteCommand = ({
  instanceName,
  monitors = [],
  components,
  createPlatformServices,
}) => {
  const platformServices = createPlatformServices();
  const allMonitors = [...platformServices.globals.getMonitors(), ...monitors];

  const logController = createLogController({
    console: globalThis.console,
    createLogger,
    instanceName,
    getMonitors: () => allMonitors,
    storage: platformServices.storage.createNamespacedStorage(
      `instance.${instanceName}.`,
    ).session,
  });

  const { setDebugEnabled, logger, createComponentLogger } = logController;

  const parsedQueryString = queryString.parse(
    platformServices.globals.getLocationSearch(),
  );
  if (parsedQueryString[debugQueryParam] !== undefined) {
    setDebugEnabled(stringToBoolean(parsedQueryString[debugQueryParam]), {
      fromConfig: false,
    });
  }

  const apexDomain = getApexDomain(
    platformServices.globals.getHostname(),
    platformServices.cookie,
  );
  const { fireReferrerHideableImage } = platformServices.globals;
  const getAssuranceValidationTokenParams =
    createGetAssuranceValidationTokenParams({
      getLocationSearch: () => platformServices.globals.getLocationSearch(),
      storage:
        platformServices.storage.createNamespacedStorage("validation.")
          .persistent,
    });
  const getBrowser = injectGetBrowser({
    userAgent: platformServices.globals.getUserAgent(),
  });

  const componentRegistry = createComponentRegistry();
  const lifecycle = createLifecycle(componentRegistry);

  const componentCreators = components.concat(
    Object.values(requiredComponents),
  );

  const setDebugCommand = (options) => {
    setDebugEnabled(options.enabled, { fromConfig: false });
  };

  const loggingCookieJar = createLoggingCookieJar({
    logger,
    cookieJar: platformServices.cookie,
  });
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

    const sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendFetchRequest: platformServices.network.sendFetchRequest,
      sendBeaconRequest: platformServices.network.sendBeaconRequest,
      isRequestRetryable,
      getRequestRetryDelay,
    });
    const processWarningsAndErrors = injectProcessWarningsAndErrors({
      logger,
    });
    const extractEdgeInfo = injectExtractEdgeInfo({ logger });
    const createResponse = injectCreateResponse({ extractEdgeInfo });
    const getLocationHint = injectGetLocationHint({
      orgId,
      cookieJar: platformServices.cookie,
    });
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
          loggingCookieJar,
          instanceName,
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
          apexDomain,
          getBrowser,
          cookieTransfer,
          createResponse,
          platformServices,
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
  logger.logOnInstanceCreated({ instance: executeCommand });
  return executeCommand;
};
