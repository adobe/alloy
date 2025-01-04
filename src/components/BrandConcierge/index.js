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
import {isNonEmptyString} from "../../utils/index.js";
import {executeRemoteScripts} from "../Personalization/dom-actions/scripts.js";
import validateMessage from "./validateMessage.js";

const fetch = window.fetch;

const CONVERSATION_SERVICE_URL = "https://experience-platform-aep-gen-ai-assistant-exp86-v2.corp.ethos12-stage-va7.ethos.adobe.net/brand-concierge/chats";
const getConversationServiceUrl = (datastreamId, ecid) => {
  return `${CONVERSATION_SERVICE_URL}?datastream_id=${datastreamId}&ecid=${ecid}`;
};

const getBody = (question) => {
  if(isNonEmptyString(question)) {
    return {
      message: question
    };
  }
  return {};
};
const shouldInsertBtn = () => {
  const bcButton = document.querySelector("#adobe-bc-btn");
  if(!bcButton) {
    return true;
  }
  return false;
};

const createBrandConcierge = ({logger, eventManager, consent, config, instanceName}) => {
  const { datastreamId } = config;

  const fetchConversationServiceEvent = (options) => {
    const url = getConversationServiceUrl(datastreamId, "68669774529250157325579584343949770920");
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getBody(options.message))
    });
  };

  return {
      lifecycle: {
        onResponse: ({response}) => {
          const handles = response.getPayloadsByType("brandConcierge:configuration");

           if(shouldInsertBtn()) {
             window.addEventListener("adobe-band-concierge-loaded", () => {
               window.dispatchEvent(new CustomEvent("alloy-brand-concierge-instance", {detail: {type: "loaded", instanceName: instanceName}}));
             });
          executeRemoteScripts([handles[0].src]);
       }
        },
      },
      commands: {
        sendBrandConciergeEvent: {
          optionsValidator: (options) =>
            validateMessage({ logger, options }),
          run: fetchConversationServiceEvent,
        }
      }
    };
};
  createBrandConcierge.namespace = "BrandConcierge";

  export default createBrandConcierge;
