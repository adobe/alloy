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
import createEventSource from "./createEventSource.js";
import isRequestRetryable from "../../core/network/isRequestRetryable.js";
import getRequestRetryDelay from "../../core/network/getRequestRetryDelay.js";
import uuid from "../../utils/uuid.js";
import extractResponse from "./extractResponse.js";

export default ({ session, eventManager, loggingCookieJar, config, logger, fetch, buildEndpointUrl }) => {
  const { edgeDomain, edgeBasePath, datastreamId } = config;
  const eventSource = createEventSource({logger, isRequestRetryable, getRequestRetryDelay, fetch, config});
  // const BC_SESSION_COOKIE_NAME = "bc_session_id";
  // const IDENTITY_COOKIE_NAME = "identity";

  const decodeKndctrCookie = createGetEcidFromCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });
  return (options) => {
    //const sessionId = getConciergeSessionCookie({loggingCookieJar, config}) || uuid();

    const {message, onStreamResponse, feedback} = options;
    const onFailureCallback = (error) => { console.log("error", error); onStreamResponse({error})};
    const onStreamResponseCallback = ( { data }) => {
      const substr = data.replace("data: ", "");
      const response = extractResponse(substr);
      console.log("onStreamResponse called with", response);
      onStreamResponse({response});
    };
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
    const url = buildEndpointUrl({edgeDomain, edgeBasePath, datastreamId, request});
    return eventSource({requestId: uuid(), url, request, onStreamResponseCallback, onFailureCallback});
  };
};
