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
import { PERSONALIZATION_DECISIONS_HANDLE } from "./constants/handle";

export default ({
  autoRenderingHandler,
  nonRenderingHandler,
  groupDecisions,
  handleRedirectDecisions,
  showContainers
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(
      PERSONALIZATION_DECISIONS_HANDLE
    );
    const viewName = personalizationDetails.getViewName();

    // if personalization payload is empty return empty decisions array
    if (unprocessedDecisions.length === 0) {
      showContainers();
      decisionsDeferred.resolve({});
      return {
        decisions: [],
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
