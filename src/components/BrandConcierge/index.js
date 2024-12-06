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

const BRAND_CONCIERGE_URL = "https://experience-platform-aep-gen-ai-assistant-exp86.corp.ethos12-stage-va7.ethos.adobe.net/copilot/chats?response_format=markdown";
const fetch = window.fetch;

const fetchResponse = (message) => {
  return fetch(BRAND_CONCIERGE_URL, {
    method: "POST",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEtc3RnMS1rZXktYXQtMS5jZXIiLCJraWQiOiJpbXNfbmExLXN0ZzEta2V5LWF0LTEiLCJpdHQiOiJhdCJ9.eyJpZCI6IjE3MzE5OTYxNDM3OTBfOWQxMzAzMGUtMTY3My00MDRiLWJjNmYtYjAyM2VmN2JlMTBiX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjFDREYxOTRBNjcyM0EzOEIwQTQ5NDAyRUA1M2VhMTcxZjYzMThmZDI3NDk0MjI3LmUiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS1zdGcxLmFkb2JlbG9naW4uY29tL2ltcy9zZXNzaW9uL3YxL05XWmxaakV3TjJZdE9UUXhOaTAwTkdNNUxXSTNOell0T0RNMlpUazRNRE16WWpGa0xTMUJNRFl6TXpWRE1EVkRSRFEwT1VNek1FRTBPVFF3TXpaQVl6WXlaakkwWTJNMVlqVmlOMlV3WlRCaE5EazBNREEwXCJ9IiwiYXMiOiJpbXMtbmExLXN0ZzEiLCJhYV9pZCI6IkEwNjMzNUMwNUNENDQ5QzMwQTQ5NDAzNkBjNjJmMjRjYzViNWI3ZTBlMGE0OTQwMDQiLCJjdHAiOjAsImZnIjoiWTYzUVZINlA3WjJYQjREWjNHWk1BMklBVTQ9PT09PT0iLCJzaWQiOiIxNzMxMjM5NTMyMTUyX2ViOTY4MjBiLTM0NWMtNDcyYS1iMDllLTQ1ZDc4MDAxNjlhY191dzIiLCJtb2kiOiIzZTk3YzczOSIsInBiYSI6Ik9SRyxNZWRTZWNOb0VWLExvd1NlYyIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsInNjb3BlIjoiYWIubWFuYWdlLGFjY291bnRfY2x1c3Rlci5yZWFkLGFkZGl0aW9uYWxfaW5mbyxhZGRpdGlvbmFsX2luZm8uam9iX2Z1bmN0aW9uLGFkZGl0aW9uYWxfaW5mby5wcm9qZWN0ZWRQcm9kdWN0Q29udGV4dCxhZGRpdGlvbmFsX2luZm8ucm9sZXMsQWRvYmVJRCxhZG9iZWlvLmFwcHJlZ2lzdHJ5LnJlYWQsYWRvYmVpb19hcGksYXVkaWVuY2VtYW5hZ2VyX2FwaSxjcmVhdGl2ZV9jbG91ZCxtcHMsb3BlbmlkLG9yZy5yZWFkLHBwcy5yZWFkLHJlYWRfb3JnYW5pemF0aW9ucyxyZWFkX3BjLHJlYWRfcGMuYWNwLHJlYWRfcGMuZG1hX3RhcnRhbixzZXJ2aWNlX3ByaW5jaXBhbHMud3JpdGUsc2Vzc2lvbiIsImNyZWF0ZWRfYXQiOiIxNzMxOTk2MTQzNzkwIn0.fB2X-cPFdlinHIXgY2Kgr_lgluwSMICiMS2SceSApP-Us1ac9iZfYtLtqfyzaSCl335rCcC1GCNSRbbZI4Jvrkko38po6xA5trukYpOrVMAaqgESD3mdOgie6vw7hSPiN_MxJgRf-TT0HPca0SB7LRRqA1f8t5enfbvxZUUc_s6waMHiJDvdeongbtft3fWVDFlTcJDZjO306W0WbyXGwJcB3di69ZdGVKFMQccwfN1NZRWHJUNj0iXk3Trxi6MeCJqiHx-rqXNWIltNZC0FJqc8Bjd3HNmpp5oVGsDewApxRKxLBFRm4oXJwJX9qKyuMBDAG6hhPL02gty1yesOLA",
      "x-api-key": "exc_app",
      "x-gw-ims-org-id": "52C418126318FCD90A494134@AdobeOrg",
      "x-sandbox-name": "prod",
      "Content-Type": "application/vnd.adobe.copilot.v1+json",
      "Accept": "application/vnd.adobe.copilot.v1+json"
    },
    body: JSON.stringify(getBody(message))
  });
};

const getBody = (question) => {
  if(isNonEmptyString(question)) {
    return {
      message: question,
      featureOverride: {
        "aep-copilot-agent-selector": "copilot_brand_concierge_v1"
      }
    };
  }
  return {};
};
const checkBCExists = () => {
  const bcButton = document.querySelector("#adobe-bc-btn");
  if(bcButton) {
    return true;
  }
  return false;
};

const sendBrandConciergeEvent = (options) => {
  return fetchResponse(options.message);
};



const createBrandConcierge = ({logger, eventManager, consent, config, instanceName}) => {
  window.addEventListener("message", (event) => {
    fetchResponse(event.data.question).then((response) => {
      const { interaction } = JSON.parse(response);

      event.source.postMessage({type: "response", request: interaction.request.message, response: interaction.response}, event.origin);
    });
  });
    return {
      lifecycle: {
        onResponse: ({response}) => {
          const handles = response.getPayloadsByType("brandConcierge:configuration");
           if(!checkBCExists) {
             window.addEventListener("adobe-band-concierge-loaded", () => {
               window.dispatchEvent(new CustomEvent("alloy-brand-concierge-instance", {detail: {type: "loaded", instanceName: instanceName}}));
             });
          const script = executeRemoteScripts([handles[0].src]);
       }
        },
      },
      commands: {
        sendBrandConciergeEvent: {
          optionsValidator: (options) =>
            validateMessage({ logger, options }),
          run: sendBrandConciergeEvent,
        }
      }
    };
};
  createBrandConcierge.namespace = "BrandConcierge";

  export default createBrandConcierge;
