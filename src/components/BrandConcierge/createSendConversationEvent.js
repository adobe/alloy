/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { createDataCollectionRequestPayload } from "../../utils/request/index.js";
import createConversationServiceRequest from "./createConversationServiceRequest.js";
import createGetEcidFromCookie from "../../utils/createDecodeKndctrCookie.js";
import {getConciergeSessionCookie, getPageSurface} from "./utils.js";
import isRequestRetryable from "../../core/network/isRequestRetryable.js";
import getRequestRetryDelay from "../../core/network/getRequestRetryDelay.js";
import uuid from "../../utils/uuid.js";
import createStreamParser from "./createStreamParser.js";
import createSendConversationServiceRequest from "./createSendConversationServiceRequest.js";

export default ({
  consent,
  eventManager,
  loggingCookieJar,
  config,
  logger,
  fetch,
  buildEndpointUrl,
  lifecycle,
  cookieTransfer,
  createResponse
}) => {
  const { edgeDomain, edgeBasePath, datastreamId, onBeforeEventSend } = config;
  const sendConversationServiceRequest = createSendConversationServiceRequest({
    logger,
    isRequestRetryable,
    getRequestRetryDelay,
    fetch,
    config,
  });

  const decodeKndctrCookie = createGetEcidFromCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });
  return (options) => {
    let streamingEnabled = false;
    const { message, onStreamResponse, xdm, data } = options;
    const sessionId = getConciergeSessionCookie({loggingCookieJar, config});
    const payload = createDataCollectionRequestPayload();
    const request = createConversationServiceRequest({
      payload,
      sessionId: sessionId || uuid()
    });

    const event = eventManager.createEvent();
    if (message || data) {
      const pageSurface = getPageSurface();
      event.mergeQuery({ conversation: {
          surfaces: [pageSurface],
          message,
          data
        }});
    }

    const ecid = decodeKndctrCookie();

    event.mergeXdm({
      identityMap: {
        ECID: [
          {
            id: ecid,
          },
        ],
      }
    });

    event.mergeXdm({...xdm});

    if(message) {
      streamingEnabled = true;
    }
    const url = buildEndpointUrl({
      edgeDomain,
      edgeBasePath,
      datastreamId,
      request,
    });
    return consent.awaitConsent().then(() => {
      return lifecycle
        .onBeforeEvent({
          event
        }).then(() => {
          try {
            // NOTE: this calls onBeforeEventSend callback (if configured)
            event.finalize(onBeforeEventSend);
          } catch (error) {
            onStreamResponse({ error });
            throw error;
          }
          payload.addEvent(event);
          return sendConversationServiceRequest({
            requestId: uuid(),
            url,
            request,
            onStreamResponse,
            streamingEnabled
          }).then(response => {
            if(response.status === 204) {
              return;
            }
            const onStreamResponseCallback = (event) => {
              if(event.error) {
                onStreamResponse({ error: event.error });
              }
              const substr = event.data.replace("data: ", "");
              const responseJson = JSON.parse(substr);
              const response = createResponse({ content: responseJson});

              cookieTransfer.responseToCookies(response);

              logger.info("onStreamResponse callback called with", response.getPayloadsByType("brand-concierge:conversation"));
              onStreamResponse(response.getPayloadsByType("brand-concierge:conversation"));
            };

            const streamParser = createStreamParser();

            streamParser(
              response.body,
              onStreamResponseCallback
            );
          });
      });
    });
  };
};
