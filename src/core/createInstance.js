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
import buildAndValidateConfig from "./buildAndValidateConfig.js";
import initializeComponents from "./initializeComponents.js";
import createConfig from "./config/createConfig.js";
import createCoreConfigs from "./config/createCoreConfigs.js";
import injectHandleError from "./injectHandleError.js";
import createLogger from "./createLogger.js";
import createEventManager from "./createEventManager.js";
import createCookieTransfer from "./createCookieTransfer.js";
import injectShouldTransferCookie from "./injectShouldTransferCookie.js";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
} from "../utils/request/index.js";
import injectSendEdgeNetworkRequest from "./edgeNetwork/injectSendEdgeNetworkRequest.js";
import injectProcessWarningsAndErrors from "./edgeNetwork/injectProcessWarningsAndErrors.js";
import injectGetLocationHint from "./edgeNetwork/injectGetLocationHint.js";
import isRequestRetryable from "./network/isRequestRetryable.js";
import getRequestRetryDelay from "./network/getRequestRetryDelay.js";
import injectApplyResponse from "./edgeNetwork/injectApplyResponse.js";
import * as requiredComponents from "./requiredComponentCreators.js";


export const createExecuteCommand = ({
  instanceName,
  logController: { logger, createComponentLogger },
  components,
  getAssuranceToken,
  sendRequest,
  getState,
  updateState,
  getStateEntry,
  context,
}) => {
  const coreConfigValidators = createCoreConfigs(context);

  const componentRegistry = createComponentRegistry();
  const lifecycle = createLifecycle(componentRegistry);

  const componentCreators = components.concat(
    Object.values(requiredComponents),
  );

  const configureCommand = (options) => {
    const { config, queuedLogger } = buildAndValidateConfig({
      options,
      componentCreators,
      coreConfigValidators,
      createConfig,
      logger,
    });
    console.log("config", config);
    const { orgId, targetMigrationEnabled } = config;
    const shouldTransferCookie = injectShouldTransferCookie({
      orgId,
      targetMigrationEnabled,
    });
    const cookieTransfer = createCookieTransfer({
      shouldTransferCookie,
      getState,
      updateState,
    });
    const sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendRequest,
      isRequestRetryable,
      getRequestRetryDelay,
    });
    const processWarningsAndErrors = injectProcessWarningsAndErrors({
      logger,
    });
    const extractEdgeInfo = injectExtractEdgeInfo({ logger });
    const createResponse = injectCreateResponse({ extractEdgeInfo });
    const getLocationHint = injectGetLocationHint({ orgId, getStateEntry });
    const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
      config,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors,
      getLocationHint,
      getAssuranceToken,
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
          logger: componentLogger,
          lifecycle,
          sendEdgeNetworkRequest,
          handleError: injectHandleError({
            errorPrefix: `[${instanceName}] [${componentName}]`,
            logger: componentLogger,
          }),
        };
      },
    }).then((componentRegistry) => {
      queuedLogger.flush();
      return componentRegistry;
    });
  };

  const handleError = injectHandleError({
    errorPrefix: `[${instanceName}]`,
    logger,
  });

  const executeCommand = injectExecuteCommand({
    logger,
    configureCommand,
    handleError,
    validateCommandOptions,
  });
  return executeCommand;
};

export default ({
  components,
  instanceName,
  getMonitors,
  getAssuranceToken,
  sendRequest,
  getState,
  updateState,
  getStateEntry,
  context,
}) => {

  const logController = createLogController({
    createLogger,
    instanceName,
    getMonitors,
  });

  const executeCommand = createExecuteCommand({
    instanceName,
    logController,
    components,
    getAssuranceToken,
    sendRequest,
    getState,
    updateState,
    getStateEntry,
    context,
  });

  return executeCommand;
  //return createInstanceFunction(executeCommand);
};
