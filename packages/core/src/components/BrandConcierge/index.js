/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import validateMessage from "./validateMessage.js";
import createSendConversationEvent from "./createSendConversationEvent.js";
import createBuildEndpointUrl from "./createBuildEndpointUrl.js";
import queryString from "@adobe/reactor-query-string";
import { getNamespacedCookieName } from "../../utils/index.js";
import { BC_SESSION_COOKIE_NAME } from "./constants.js";
import { boolean, objectOf } from "../../utils/validation/index.js";

const createConciergeComponent = ({
  loggingCookieJar,
  logger,
  eventManager,
  consent,
  instanceName,
  sendEdgeNetworkRequest,
  config,
  lifecycle,
  cookieTransfer,
  createResponse,
  apexDomain,
}) => {
  const { fetch } = window;
  if (!config.stickyConversationSession) {
    loggingCookieJar.remove(
      getNamespacedCookieName(config.orgId, BC_SESSION_COOKIE_NAME),
      { domain: apexDomain },
    );
  }

  const buildEndpointUrl = createBuildEndpointUrl({ queryString });

  const sendConversationEvent = createSendConversationEvent({
    loggingCookieJar,
    logger,
    eventManager,
    consent,
    instanceName,
    sendEdgeNetworkRequest,
    config,
    fetch,
    buildEndpointUrl,
    lifecycle,
    cookieTransfer,
    createResponse,
  });

  return {
    commands: {
      sendConversationEvent: {
        optionsValidator: (options) => validateMessage({ logger, options }),
        run: sendConversationEvent,
      },
    },
  };
};
createConciergeComponent.namespace = "BrandConcierge";
createConciergeComponent.configValidators = objectOf({
  stickyConversationSession: boolean().default(false),
});
export default createConciergeComponent;
