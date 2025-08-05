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
import {executeRemoteScripts} from "../Personalization/dom-actions/scripts.js";
import validateMessage from "./validateMessage.js";
import {createDataCollectionRequestPayload} from "../../utils/request/index.js";
import createConversationServiceRequest from "./createConversationServiceRequest.js";
import {buildPageSurface} from "../../utils/surfaceUtils.js";
import createGetPageLocation from "../../utils/dom/createGetPageLocation.js";
import uuid from "../../utils/uuid.js";
import {cookieJar, noop, sanitizeOrgIdForCookieName} from "../../utils/index.js";
import COOKIE_NAME_PREFIX from "../../constants/cookieNamePrefix.js";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import createGetEcidFromCookie from "../Identity/createDecodeKndctrCookie.js";
import validateConcierge from "./validateConcierge.js";
const BC_SESSION_COOKIE_NAME = "bc_session_id";
const IDENTITY_COOKIE_NAME = "identity";

// to be removed later
const sessionId = uuid();

const getPageSurface = (getPageLocation) => {
  return buildPageSurface(getPageLocation);
};

const getECID_cookie = ({loggingCookieJar, config}) => {
  const cookieName = getEcidCookieName(config);

  return loggingCookieJar.get(cookieName);
}

const getEcidCookieName = (config) => {
  const sanitizedOrgId = sanitizeOrgIdForCookieName(config.orgId);
  return `${COOKIE_NAME_PREFIX}_${sanitizedOrgId}_${IDENTITY_COOKIE_NAME}`;
};
const getConciergeSessionCookieName = (config) => {
  const sanitizedOrgId = sanitizeOrgIdForCookieName(config.orgId);
  return `${COOKIE_NAME_PREFIX}_${sanitizedOrgId}_${BC_SESSION_COOKIE_NAME}`;
};
const createConciergeSessionCookieName = (name, value, maxAge, sameSite= true) => {

  const options = {};

  if (maxAge !== undefined) {
    // cookieJar expects "expires" as a date object
    options.expires = new Date(
      (new Date()).getTime() + maxAge * 1000,
    );
  }
  if (sameSite !== undefined) {
    options.sameSite = sameSite;
  }
  try{
    cookieJar.set(
      name,
      value,
      options
    );
  }catch(e){
    console.log(e);
  }

};
const getConciergeSessionCookie = ({loggingCookieJar, config}) => {
  const cookieName = getConciergeSessionCookieName(config);
  return loggingCookieJar.get(cookieName);
}

const streamRequest = (message, surfaces, sessionId, configId, streamResponseCallback, ecid) => {
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
      createConciergeSessionCookieName(key, value, maxAge);
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
/*

  const bufferedMessages = [];
  const bufferedPromptSuggestions = [];
  const messagesDiv = document.getElementById("messages-content");
  const promptSuggestionsDiv = document.getElementById("prompt-suggestions-content");
*/

  const processMessage = (data) => {
    const response = extractResponse(data);

    if (!response) {
      return;
    }
    streamResponseCallback(response);

   // const { message, promptSuggestions, state } = response;

    /*if (state !== "completed") {
      bufferedMessages.push(message);
      bufferedPromptSuggestions.push.apply(bufferedPromptSuggestions, promptSuggestions);

      const messagesHtml = marked.parse(bufferedMessages.join("\n"));
      messagesDiv.innerHTML = messagesHtml;

      const promptSuggestionsHtml = marked.parse(bufferedPromptSuggestions.join("\n"));
      promptSuggestionsDiv.innerHTML = promptSuggestionsHtml;
    } else {
      messagesDiv.innerHTML = marked.parse(message);
      promptSuggestionsDiv.innerHTML = marked.parse(promptSuggestions.join("\n"));
    }*/
  }
    createEventSource((data) => {
      processMessage(data);
    });
  return Promise.resolve({});
}

const createBrandConcierge = ({loggingCookieJar, logger, eventManager, consent, instanceName, sendEdgeNetworkRequest, config}) => {
  const decodeKndctrCookie = createGetEcidFromCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });
  const brandConciergeConfig = {
    initialized: false
  };
  const getPageLocation = createGetPageLocation({window: window});


  return {
      lifecycle: {
        onBeforeEvent({
                        event,
                        renderDecisions,
                        decisionScopes = [],
                        personalization = {},
                        onResponse = noop,
                        onRequestFailure = noop,
                      }) {

        },
        onResponse: ({response}) => {
          //const configurationPayload = response.getPayloadsByType("brand-concierge:config");
          const configurationPayload = [{src: "./main.js"}]
          if(configurationPayload.length>0) {
            if (!brandConciergeConfig.initialized) {
              window.addEventListener("adobe-brand-concierge-prompt-loaded", () => {
                // in the next event payload we can add urls to the styles and scripts that the prompt needs
                window.dispatchEvent(new CustomEvent("alloy-brand-concierge-instance", {
                  detail: {
                    type: "loaded",
                    instanceName: instanceName,
                    contentUrl: "./acom-hackathon.json"
                  }
                }));
              });

              executeRemoteScripts([configurationPayload[0]?.src]).then(() => {
                brandConciergeConfig.initialized = true;
              });
            }
          }

          const conversationPayload = response.getPayloadsByType("brand-concierge:conversation");
          if(conversationPayload.length > 0) {
            return conversationPayload[0];
          }
        }
      },
      commands: {
        bootstrapConcierge: {
          optionsValidator: () => validateConcierge({logger, options}),
          run: bootstrapConcierge
          }
        },
        sendBrandConciergeEvent: {
          optionsValidator: (options) =>
            validateMessage({ logger, options }),
          run: sendConversationServiceEvent,
        }
      }
    };
};
  createBrandConcierge.namespace = "BrandConcierge";

  export default createBrandConcierge;
