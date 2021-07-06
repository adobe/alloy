/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import isNonEmptyArray from "../../utils/isNonEmptyArray";
import { DECISIONS_DEPRECATED_WARNING } from "./constants/loggerMessage";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  autoRenderingHandler,
  nonRenderingHandler,
  groupDecisions,
  handleRedirectDecisions,
  showContainers,
  logger
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    const viewName = personalizationDetails.getViewName();

    // if personalization payload is empty return empty decisions array
    if (unprocessedDecisions.length === 0) {
      showContainers();
      decisionsDeferred.resolve({});
      return {
        get decisions() {
          logger.warn(DECISIONS_DEPRECATED_WARNING);
          return [];
        },
        propositions: []
      };
    }

    const {
      redirectDecisions,
      pageWideScopeDecisions,
      viewDecisions,
      nonAutoRenderableDecisions
    } = groupDecisions(unprocessedDecisions);

    if (
      personalizationDetails.isRenderDecisions() &&
      isNonEmptyArray(redirectDecisions)
    ) {
      decisionsDeferred.resolve({});
      return handleRedirectDecisions(redirectDecisions);
    }
    // save decisions for views in local cache
    decisionsDeferred.resolve(viewDecisions);

    if (personalizationDetails.isRenderDecisions()) {
      return autoRenderingHandler({
        viewName,
        pageWideScopeDecisions,
        nonAutoRenderableDecisions
      });
    }
    return nonRenderingHandler({
      viewName,
      redirectDecisions,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    });
  };
};
