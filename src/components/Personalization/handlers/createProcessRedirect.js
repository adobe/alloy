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
export default ({ logger, executeRedirect, collect }) =>
  (item) => {
    const { content } = item.getData() || {};

    if (!content) {
      logger.warn("Invalid Redirect data", item.getData());
      return {};
    }

    const render = () => {
      return collect({
        decisionsMeta: [item.getProposition().getNotification()],
        documentMayUnload: true,
      }).then(() => {
        logger.logOnContentRendering({
          status: "rendering-redirect",
          detail: {
            propositionDetails: item.getProposition().getNotification(),
            item: item.toJSON()
          },
          message: `Redirect action ${item.toString()} executed.`,
          logLevel: "info",
        });
        return executeRedirect(content);
        // Execute redirect will never resolve. If there are bottom of page events that are waiting
        // for display notifications from this request, they will never run because this promise will
        // not resolve. This is intentional because we don't want to run bottom of page events if
        // there is a redirect.
      });
    };

    return { render, setRenderAttempted: true, onlyRenderThis: true };
  };
