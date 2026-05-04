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
import { hideElements, showElements } from "../flicker/index.js";

const REDIRECT_HIDING_ELEMENT = "BODY";
export default ({ logger, executeRedirect, collect }) =>
  (item) => {
    const { content } = item.getData() || {};

    if (!content) {
      logger.warn("Invalid Redirect data", item.getData());
      return {};
    }

    const render = () => {
      hideElements(REDIRECT_HIDING_ELEMENT);
      return collect({
        decisionsMeta: [item.getProposition().getNotification()],
        documentMayUnload: true,
        identityMap: item.getProposition().getIdentityMap(),
      })
        .then(() => {
          logger.logOnContentRendering({
            status: "rendering-redirect",
            detail: {
              propositionDetails: item.getProposition().getNotification(),
              redirect: content,
            },
            message: `Redirect action ${item.toString()} executed.`,
            logLevel: "info",
          });
          return executeRedirect(content);
          // Execute redirect will never resolve. If there are bottom of page events that are waiting
          // for display notifications from this request, they will never run because this promise will
          // not resolve. This is intentional because we don't want to run bottom of page events if
          // there is a redirect.
        })
        .catch((error) => {
          showElements(REDIRECT_HIDING_ELEMENT);
          throw error;
        });
    };

    return { render, setRenderAttempted: true, onlyRenderThis: true };
  };
