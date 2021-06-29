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

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  autoRenderingHandler,
  nonRenderingHandler,
  decisionsExtractor,
  handleRedirectDecisions,
  showContainers
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
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
      formBasedComposedDecisions
    } = decisionsExtractor.groupDecisions(unprocessedDecisions);

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
        formBasedComposedDecisions
      });
    }
    return nonRenderingHandler({
      viewName,
      redirectDecisions,
      pageWideScopeDecisions,
      formBasedComposedDecisions
    });
  };
};
