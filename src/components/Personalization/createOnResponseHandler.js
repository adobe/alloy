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
import { isEmptyObject } from "../../utils";
import { DOM_ACTION, REDIRECT_ITEM } from "./constants/schema";
import PAGE_WIDE_SCOPE from "./constants/scope";
import isNonEmptyArray from "../../utils/isNonEmptyArray";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  decisionsExtractor,
  executeDecisions,
  executeCachedViewDecisions,
  handleRedirectDecisions,
  showContainers
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    const viewName = personalizationDetails.getViewName();
    if (unprocessedDecisions.length === 0) {
      showContainers();
      decisionsDeferred.resolve({});
      return { decisions: [] };
    }

    const decisionsGroupedByRedirectItemSchema = decisionsExtractor.groupDecisionsBySchema(
      {
        decisions: unprocessedDecisions,
        schema: REDIRECT_ITEM
      }
    );

    if (
      isNonEmptyArray(decisionsGroupedByRedirectItemSchema.matchedDecisions) &&
      personalizationDetails.isRenderDecisions()
    ) {
      decisionsDeferred.resolve({});
      return handleRedirectDecisions(
        decisionsGroupedByRedirectItemSchema.matchedDecisions
      );
    }

    const decisionsGroupedByDomActionSchema = decisionsExtractor.groupDecisionsBySchema(
      {
        decisions: decisionsGroupedByRedirectItemSchema.notMatchedDecisions,
        schema: DOM_ACTION
      }
    );
    const {
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    } = decisionsExtractor.groupDecisionsByScope({
      decisions: decisionsGroupedByDomActionSchema.matchedDecisions,
      scope: PAGE_WIDE_SCOPE
    });

    if (isEmptyObject(nonPageWideScopeDecisions)) {
      decisionsDeferred.resolve({});
    } else {
      decisionsDeferred.resolve(nonPageWideScopeDecisions);
    }

    if (personalizationDetails.isRenderDecisions()) {
      executeDecisions(pageWideScopeDecisions);
      if (viewName) {
        executeCachedViewDecisions({ viewName });
      }
      showContainers();
      return {
        decisions: decisionsGroupedByDomActionSchema.notMatchedDecisions
      };
    }

    const decisionsToBeReturned = [
      ...pageWideScopeDecisions,
      ...decisionsGroupedByDomActionSchema.notMatchedDecisions,
      ...decisionsGroupedByRedirectItemSchema.matchedDecisions
    ];

    if (viewName && nonPageWideScopeDecisions[viewName]) {
      decisionsToBeReturned.push(...nonPageWideScopeDecisions[viewName]);
    }

    return { decisions: decisionsToBeReturned };
  };
};
