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
import { getPageSurface } from "./utils.js";
import uuid from "../../utils/uuid.js";
import createStreamParser from "./createStreamParser.js";
import createTimeoutWrapper from "./createTimeoutWrapper.js";
import type { StreamEvent } from "./createStreamParser.js";
import type { BuildEndpointUrl } from "./createBuildEndpointUrl.js";
import type { SendConversationServiceRequest } from "./createSendConversationServiceRequest.js";
import type { BrandConciergeConfig } from "./configValidators.js";
import type { ConversationEventOptions } from "./validateMessage.js";
import type { ComponentTools, ResponseCreator } from "../../core/types.js";

export interface CreateSendConversationEventOptions extends Partial<
  Pick<
    ComponentTools,
    "loggingCookieJar" | "instanceName" | "sendEdgeNetworkRequest"
  >
> {
  eventManager: ComponentTools["eventManager"];
  config: BrandConciergeConfig;
  logger: ComponentTools["logger"];
  sendConversationServiceRequest: SendConversationServiceRequest;
  buildEndpointUrl: BuildEndpointUrl;
  cookieTransfer: ComponentTools["cookieTransfer"];
  alwaysTransferCookies?: string[];
  createResponse: ResponseCreator;
  decodeKndctrCookie: () => string | null;
  lifecycle: Pick<ComponentTools["lifecycle"], "onBeforeEvent">;
  consent: Pick<ComponentTools["consent"], "current">;
  session: { id: string };
  getPageLocation: ComponentTools["platformServices"]["globals"]["getPageLocation"];
}

export type SendConversationEvent = (
  options: ConversationEventOptions,
) => Promise<void>;

export default ({
  eventManager,
  config,
  logger,
  sendConversationServiceRequest,
  buildEndpointUrl,
  cookieTransfer,
  alwaysTransferCookies = [],
  createResponse,
  decodeKndctrCookie,
  lifecycle,
  consent,
  session,
  getPageLocation,
}: CreateSendConversationEventOptions): SendConversationEvent => {
  const { edgeDomain, datastreamId, onBeforeEventSend, conversation } = config;
  return (options) => {
    let streamingEnabled = false;
    const {
      message,
      onStreamResponse,
      xdm,
      data,
      voiceEnabled = false,
      surfaces: requestSurfaces,
    } = options;
    const payload = createDataCollectionRequestPayload();
    const request = createConversationServiceRequest({
      payload,
      sessionId: session.id,
      voiceEnabled,
      region: conversation.region,
    });

    const event = eventManager.createEvent();
    if (message || data) {
      const surfaces = [...(requestSurfaces || [])];
      const pageSurface = getPageSurface(getPageLocation);
      if (!surfaces.includes(pageSurface)) {
        surfaces.push(pageSurface);
      }
      event.mergeQuery({
        conversation: {
          surfaces,
          message,
          data,
        },
      });
    }

    const { state } = consent.current();
    event.mergeMeta({
      consent: {
        state: state,
      },
    });

    const ecid = decodeKndctrCookie();

    event.mergeXdm({
      identityMap: {
        ECID: [
          {
            id: ecid,
          },
        ],
      },
    });

    event.mergeXdm({ ...xdm });

    if (message || data) {
      streamingEnabled = true;
    }
    const url = buildEndpointUrl({
      edgeDomain,
      datastreamId,
      request,
    });
    return lifecycle
      .onBeforeEvent({
        event,
      })
      .then(() => {
        try {
          // NOTE: this calls onBeforeEventSend callback (if configured)
          event.finalize(onBeforeEventSend);
        } catch (error) {
          onStreamResponse({ error });
          throw error;
        }

        payload.addEvent(event);
        cookieTransfer.cookiesToPayload(
          payload,
          edgeDomain,
          alwaysTransferCookies,
        );
        return sendConversationServiceRequest({
          requestId: uuid(),
          url,
          request,
          onStreamResponse,
          streamingEnabled,
        }).then((response) => {
          if (response.status === 204) {
            return;
          }

          const onStreamResponseCallback = (event: StreamEvent) => {
            if (event.error) {
              logger.error("Stream error occurred", event.error);
              onStreamResponse({ error: event.error });
              return;
            }
            // Non-null: the stream parser only emits non-error events that have data.
            const substr = event.data!.replace("data: ", "");
            const responseJson = JSON.parse(substr);
            const response = createResponse(
              // Cast: stream payloads carry no headers, so no getHeader is passed (getEdge is never called).
              { content: responseJson } as Parameters<ResponseCreator>[0],
            );

            cookieTransfer.responseToCookies(response);

            logger.info(
              "onStreamResponse callback called with",
              response.getPayloadsByType("brand-concierge:conversation"),
            );
            onStreamResponse(
              response.getPayloadsByType("brand-concierge:conversation"),
            );
          };

          const timeoutWrapper = createTimeoutWrapper({
            onStreamResponseCallback,
            streamTimeout: conversation.streamTimeout,
          });

          const streamParser = createStreamParser();

          // Non-null: a successful non-204 fetch response has a body.
          streamParser(response.body!, timeoutWrapper);
        });
      });
  };
};
