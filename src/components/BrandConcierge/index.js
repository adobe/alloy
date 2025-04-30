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

const getPageSurface = (getPageLocation) => {
  return buildPageSurface(getPageLocation);
};


const createBrandConcierge = ({logger, eventManager, consent, instanceName, sendEdgeNetworkRequest}) => {
  const brandConciergeConfig = {
    initialized: false
  };
  const getPageLocation = createGetPageLocation({window: window});

  const sendConversationServiceEvent = (options) => {
    const { message } = options;
    const conversationRequestPayload = createDataCollectionRequestPayload();
    const request = createConversationServiceRequest({
      conversationRequestPayload
    });

    const event = eventManager.createEvent();

    const pageSurface = getPageSurface(getPageLocation);
    event.mergeQuery({conversation: { message: message,
        surfaces: [pageSurface] }});

    event.finalize();
    conversationRequestPayload.addEvent(event);




      return sendEdgeNetworkRequest({ request }).then(() => {
        return {};
      });
  }

  return {
      lifecycle: {
        onResponse: ({response}) => {
          const configurationPayload = response.getPayloadsByType("concierge:config");
          if(configurationPayload.length>0) {
            if (!brandConciergeConfig.initialized) {
              window.addEventListener("adobe-brand-concierge-prompt-loaded", () => {
                // in the next event payload we can add urls to the styles and scripts that the prompt needs
                window.dispatchEvent(new CustomEvent("alloy-brand-concierge-instance", {
                  detail: {
                    type: "loaded",
                    instanceName: instanceName
                  }
                }));
              });

              executeRemoteScripts([configurationPayload[0]?.src]).then(() => {
                brandConciergeConfig.initialized = true;
              });
            }
          }
        }
      },
      commands: {
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
