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
import { SOURCES_QUERY_PARAM } from "./constants.js";
import type { BrandConciergeConfig } from "./configValidators.js";
import type { ComponentTools, Event } from "../../core/types.js";

export interface CreateConciergeComponentOptions extends Pick<
  ComponentTools,
  | "loggingCookieJar"
  | "logger"
  | "eventManager"
  | "consent"
  | "instanceName"
  | "sendEdgeNetworkRequest"
  | "config"
  | "lifecycle"
  | "cookieTransfer"
  | "createResponse"
  | "platformServices"
> {
  /** Test seam. */
  createSendConversationEvent?: typeof createSendConversationEvent;
}

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
  platformServices,
  createSendConversationEvent:
    createSendConversationEventFactory = createSendConversationEvent,
}: CreateConciergeComponentOptions) => {
  const session = {
    id: getConciergeSessionCookie({
      loggingCookieJar,
      // Cast: configValidators guarantees `conversation` with its defaults.
      config: config as BrandConciergeConfig,
    }),
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
  const sendConversationEvent = createSendConversationEventFactory({
    loggingCookieJar,
    logger,
    eventManager,
    consent,
    instanceName,
    sendEdgeNetworkRequest,
    // Cast: configValidators guarantees `conversation` with its defaults.
    config: config as BrandConciergeConfig,
    buildEndpointUrl,
    lifecycle,
    cookieTransfer,
    alwaysTransferCookies:
      // Cast: see above.
      (config as BrandConciergeConfig).conversation.transferCookies || [],
    createResponse,
    sendConversationServiceRequest,
    decodeKndctrCookie,
    session,
    getPageLocation: platformServices.globals.getPageLocation,
  });

  return {
    lifecycle: {
      onBeforeEvent({ event }: { event: Event }) {
        // Cast: see above.
        if ((config as BrandConciergeConfig).conversation.collectSources) {
          const parsedParams = queryString.parse(
            platformServices.globals.getLocationSearch(),
          );
          const source = parsedParams[SOURCES_QUERY_PARAM];
          if (source) {
            event.mergeXdm({ channel: { referringSource: source } });
          }
        }
      },
    },
    commands: {
      sendConversationEvent: {
        optionsValidator: (options: unknown) => validateMessage({ options }),
        run: sendConversationEvent,
      },
    },
  };
};
createConciergeComponent.namespace = "BrandConcierge";
createConciergeComponent.configValidators = configValidators;
export default createConciergeComponent;
