/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import addRenderAttemptedToDecisions from "./utils/addRenderAttemptedToDecisions";
import { DECISIONS_DEPRECATED_WARNING } from "./constants/loggerMessage";

export default ({
  viewCache,
  executeDecisions,
  executeCachedViewDecisions,
  showContainers,
  logger
}) => {
  return ({ viewName, pageWideScopeDecisions, nonAutoRenderableDecisions }) => {
    if (viewName) {
      return viewCache.getView(viewName).then(currentViewDecisions => {
        executeDecisions(pageWideScopeDecisions);
        executeCachedViewDecisions({
          viewName,
          viewDecisions: currentViewDecisions
        });
        showContainers();

        return {
          get decisions() {
            logger.warn(DECISIONS_DEPRECATED_WARNING);

            return [...nonAutoRenderableDecisions];
          },
          propositions: [
            ...addRenderAttemptedToDecisions({
              decisions: [...pageWideScopeDecisions, ...currentViewDecisions],
              renderAttempted: true
            }),
            ...addRenderAttemptedToDecisions({
              decisions: nonAutoRenderableDecisions,
              renderAttempted: false
            })
          ]
        };
      });
    }

    executeDecisions(pageWideScopeDecisions);
    showContainers();

    return {
      get decisions() {
        logger.warn(DECISIONS_DEPRECATED_WARNING);

        return [...nonAutoRenderableDecisions];
      },
      propositions: [
        ...addRenderAttemptedToDecisions({
          decisions: pageWideScopeDecisions,
          renderAttempted: true
        }),
        ...addRenderAttemptedToDecisions({
          decisions: nonAutoRenderableDecisions,
          renderAttempted: false
        })
      ]
    };
  };
};
