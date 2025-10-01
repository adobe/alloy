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
import validateConcierge from "./validateConcierge.js";
import createSendConversationEvent from "./createSendConversationEvent.js";
import createBootstrapConcierge from "./createBootstrapConcierge.js";
import { getPageSurface } from "./utils.js";
import createBuildEndpointUrl from "./createBuildEndpointUrl.js";
import queryString from "@adobe/reactor-query-string";

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

  const buildEndpointUrl = createBuildEndpointUrl({ queryString });
  const bootstrapConcierge = createBootstrapConcierge({
    logger,
    instanceName,
    loggingCookieJar,
    config,
  });
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
    lifecycle: {
      onBeforeEvent({ event, conversation }) {
        if (conversation) {
          const surfaces = getPageSurface();
          event.mergeQuery({ conversation: { ...conversation, surfaces } });
        }
      },
      onResponse: ({ response }) => {
        const configurationPayload = response.getPayloadsByType(
          "brand-concierge:config",
        );
        if (configurationPayload.length > 0) {
          return {
            concierge: { ...configurationPayload },
          };
        }
      },
    },
    commands: {
      bootstrapConversationalExperience: {
        optionsValidator: (options) => validateConcierge({ logger, options }),
        run: bootstrapConcierge,
      },
      sendConversationEvent: {
        optionsValidator: (options) => validateMessage({ logger, options }),
        run: sendConversationEvent,
      },
    },
  };
};
createConciergeComponent.namespace = "BrandConcierge";

export default createConciergeComponent;
