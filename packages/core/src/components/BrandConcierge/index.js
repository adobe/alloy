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
import { getConciergeSessionCookie } from "./utils.js";
import createGetEcidFromCookie from "../../utils/createDecodeKndctrCookie.js";
import createSendConversationServiceRequest from "./createSendConversationServiceRequest.js";
import configValidators from "./configValidators.js";

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
}) => {
  const { fetch } = window;
  const session = {
    id: getConciergeSessionCookie({ loggingCookieJar, config }),
  };

  const buildEndpointUrl = createBuildEndpointUrl({ queryString });
  const sendConversationServiceRequest = createSendConversationServiceRequest({
    logger,
    fetch,
    config,
  });

  const decodeKndctrCookie = createGetEcidFromCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });
  const sendConversationEvent = createSendConversationEvent({
    loggingCookieJar,
    logger,
    eventManager,
    consent,
    instanceName,
    sendEdgeNetworkRequest,
    config,
    buildEndpointUrl,
    lifecycle,
    cookieTransfer,
    createResponse,
    sendConversationServiceRequest,
    decodeKndctrCookie,
    session,
  });

  return {
    lifecycle: {
      onBeforeEvent({ event }) {
        const parsedParams = queryString.parse(window.location.search);
        if (parsedParams.source) {
          const source = parsedParams.source;
          event.mergeXdm({ channel: { referringSource: source } });
        }
      },
    },
    commands: {
      sendConversationEvent: {
        optionsValidator: (options) => validateMessage({ options }),
        run: sendConversationEvent,
      },
    },
  };
};
createConciergeComponent.namespace = "BrandConcierge";
createConciergeComponent.configValidators = configValidators;
export default createConciergeComponent;
