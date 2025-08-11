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
import {createDataCollectionRequestPayload} from "../../utils/request/index.js";
import createConversationServiceRequest from "./createConversationServiceRequest.js";
import createGetEcidFromCookie from "../Identity/createDecodeKndctrCookie.js";
import {getPageSurface} from "./utils.js";
import {fetchEventSource} from "@microsoft/fetch-event-source";

export default ({ session, sendEdgeNetworkRequest, eventManager, loggingCookieJar, config, logger }) => {
  // const BC_SESSION_COOKIE_NAME = "bc_session_id";
  // const IDENTITY_COOKIE_NAME = "identity";

  const streamRequest = (message, surfaces, sessionId, configId, onStreamResponse, ecid) => {
    const payload = {
      "events": [
        {
          query: {
            conversation: {
              surfaces: surfaces,
              message: message
            }
          },
          xdm: {
            identityMap: {
              ECID: [{
                id: ecid
              }]
            },
            web: {
              webPageDetails: {
                URL: window.location.href || window.location,
              },
              webReferrer: {
                URL: window.document.referrer,
              },
            }
          }
        }
      ]
    };

    const url = "https://edge-int.adobedc.net/brand-concierge/conversations?configId="+configId+"&sessionId=" +sessionId;

    const createEventSource = (callback) => {
      fetchEventSource(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(payload),

        onmessage: (event) => {
          if (event.data !== undefined) {
            const data = JSON.parse(event.data);

            callback(data);
          } else {
            console.warn("No data received");
          }
        },

        onopen: () => {
          console.log("Connection opened");
        },

        onclose: () => {
          console.log("Connection closed");
        },

        onerror: (error) => {
          console.error("SSE Error:", error);
        },
      }).then(r => {
        console.log("SSE connection established:", r);
      });
    };

    const extractResponse = (data) => {
      const { handle = [] } = data;

      if (handle.length === 0) {
        return null;
      }

      const { payload = [] } = handle[0];
      if (handle[1]) {
        const statePayload = handle[1].payload;
        const { key, value, maxAge } = statePayload[0];
        ///createConciergeSessionCookieName(key, value, maxAge);
      }

      if (payload.length === 0) {
        return null;
      }

      const { response = {}, state = "", conversationId, interactionId } = payload[0];

      if (Object.keys(response).length === 0) {
        return null;
      }

      const { message = "", promptSuggestions = [], multimodalElements = [], sources } = response;

      return { message, multimodalElements, promptSuggestions, state, sources, conversationId, interactionId };
    };


    const processMessage = (data) => {
      const response = extractResponse(data);

      if (!response) {
        return;
      }
      console.log("response", response);
      onStreamResponse(response);
    }
    createEventSource((data) => {
      processMessage(data);
    });
    return Promise.resolve({});
  }

  const decodeKndctrCookie = createGetEcidFromCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });
  return (options) => {
    //const sessionId = getConciergeSessionCookie({loggingCookieJar, config}) || uuid();

    const {message, onStreamResponse, feedback} = options;
    const payload = createDataCollectionRequestPayload();
    const request = createConversationServiceRequest({
      payload, sessionId: session.id
    });

    const event = eventManager.createEvent();

    const pageSurface = getPageSurface();
    const conversation = {
      surfaces: [pageSurface]
    };
    if (message) {
      conversation.message = message;
    }
    if (feedback) {
      conversation.feedback = feedback;
    }

    event.mergeQuery({conversation});

    const ecid = decodeKndctrCookie();

    event.mergeXdm({
      identityMap: {
        ECID: [{
          id: ecid
        }]
      },
      web: {
        webPageDetails: {
          URL: window.location.href || window.location,
        },
        webReferrer: {
          URL: window.document.referrer,
        },
      }
    });

    event.finalize();
    payload.addEvent(event);

    return streamRequest(message, [pageSurface], session.id, config.datastreamId, onStreamResponse, ecid);
  };
};
