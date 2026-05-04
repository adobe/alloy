/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createComponent from "./createComponent.js";
import configValidators from "./configValidators.js";
import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
} from "@adobe/alloy-core/utils/request";
import createAdConversionHandler from "./handlers/createAdConversionHandler.js";
import createCookieManager from "./utils/advertisingCookieManager.js";
import createHandleOnBeforeSendEvent from "./handlers/createOnBeforeSendEventHandler.js";
import createSendAdConversion from "./handlers/sendAdConversion.js";
import collectSurferId from "./identities/collectSurferId.js";
import { getID5Id } from "./identities/collectID5Id.js";
import { getRampId } from "./identities/collectRampId.js";
import {
  appendAdvertisingIdQueryToEvent,
  getUrlParams,
  isThrottled,
  normalizeAdvertiser,
} from "./utils/helpers.js";

const createAdvertising = ({
  logger,
  config,
  eventManager,
  sendEdgeNetworkRequest,
  consent,
  getBrowser,
}) => {
  const componentConfig = config.advertising;
  const cookieManager = createCookieManager({
    orgId: config.orgId,
    logger,
  });
  const adConversionHandler = createAdConversionHandler({
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    createDataCollectionRequest,
    createDataCollectionRequestPayload,
    logger,
  });
  const handleOnBeforeSendEvent = createHandleOnBeforeSendEvent({
    cookieManager,
    logger,
    getBrowser,
    consent,
    componentConfig,
    collectSurferId,
    getID5Id,
    getRampId,
    appendAdvertisingIdQueryToEvent,
    getUrlParams,
    isThrottled,
    normalizeAdvertiser,
  });
  const sendAdConversionHandler = createSendAdConversion({
    eventManager,
    cookieManager,
    adConversionHandler,
    logger,
    componentConfig,
    getBrowser,
    consent,
  });
  return createComponent({
    handleOnBeforeSendEvent,
    sendAdConversionHandler,
  });
};

createAdvertising.namespace = "Advertising";
createAdvertising.configValidators = configValidators;

export default createAdvertising;
