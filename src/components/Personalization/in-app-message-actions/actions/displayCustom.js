/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { INTERACT } from "../../constants/eventType";
import { applyStyleSetting } from "../utils";
import { DisplayType } from "../../constants/displayType";

const displayCustom = (setting, collect) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(setting.content, "text/html");

  const iframe = document.createElement("iframe");
  iframe.src = URL.createObjectURL(
    new Blob([parsedContent.documentElement.outerHTML], { type: "text/html" })
  );
  iframe.sandbox = "allow-same-origin allow-scripts";

  Object.assign(iframe.style, {
    border: "none",
    width: "100%",
    height: "100%"
  });

  const modifiedStyle = applyStyleSetting(setting);
  const iframeContainer = document.createElement("div");
  Object.assign(iframeContainer.style, modifiedStyle);
  iframeContainer.appendChild(iframe);

  /* Improvement: Once we establish a data contract with the backend and authoring UI,
  and if we have access to the display type in a more efficient manner,
  we can eliminate the use of the includes method as it has complexity of O(n).
  HTML content can potentially be large, it can impact performance.
 * */
  if (setting.content.includes(DisplayType.BANNER)) {
    document.body.prepend(iframeContainer);
  } else if (setting.content.includes(DisplayType.FULLSCREEN)) {
    Object.assign(iframeContainer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%"
    });
    document.body.appendChild(iframeContainer);
  } else {
    Object.assign(iframeContainer.style, {
      width: "50%",
      marginLeft: "25%",
      marginBottom: "50%"
    });
    document.body.appendChild(iframeContainer);
  }

  /* Thoughts: We could have used the postMessage API to communicate between the iframe and the parent window.
  but it is not working as the iframe is not from the same origin.
  when I tried using postMessage, script passed in the custom html did not work
  I got  error message as below:
   Refused to execute inline event handler because it violates the following Content Security Policy directive:
   "script-src 'self' 'unsafe-inline' 'nonce-321' cdn.jsdelivr.net assets.adobedtm.com cdn.tt.omtrdc.net". Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list.
  Even if I changed the security policy, script didn't execute
  For MVP, I have added a workaround for now. Use className="close" or className="dismiss" to close the iframe and className="forward" to navigate to the href */
  const handleMessageFromIframe = data => {
    const actionName = data.className;
    if (actionName.includes("forward")) {
      window.location.href = data.href;
    } else if (actionName.includes("dismiss") || actionName.includes("close")) {
      iframeContainer.remove();
    }
  };

  iframe.addEventListener("load", () => {
    const { addEventListener } =
      iframe.contentDocument || iframe.contentWindow.document;
    addEventListener("click", event => {
      handleMessageFromIframe(event.target);
      collect({
        eventType: INTERACT
      });
    });
  });
};

export default (settings, collect) => {
  return new Promise(resolve => {
    const { meta } = settings;

    displayCustom(settings, collect);

    resolve({ meta });
  });
};
