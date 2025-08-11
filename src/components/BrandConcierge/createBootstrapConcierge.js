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
import {executeRemoteScripts} from "../Personalization/dom-actions/scripts.js";
import uuid from "../../utils/uuid.js";

export default ({ session, logger, instanceName }) => {
  return (options) => {
    if (options.selector) {
      window.addEventListener("adobe-brand-concierge-prompt-loaded", () => {
        // in the next event payload we can add urls to the styles and scripts that the prompt needs
        window.dispatchEvent(new CustomEvent("alloy-brand-concierge-instance", {
          detail: {
            instanceName: instanceName,
            stylingConfigurations: options.stylingConfigurations,
            selector: options.selector,
            contentUrl: options.contentUrl,
          }
        }));
      });

      executeRemoteScripts([options.src]).then(() => {
        session.id = uuid();
        logger.info("Brand Concierge prompt script loaded", {instance: instanceName, sessionId: session.id});
      });
    }
  }
};
