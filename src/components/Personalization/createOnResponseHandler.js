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
import { DOM_ACTION } from "./constants/schema";
import PAGE_WIDE_SCOPE from "./constants/scope";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  viewCache,
  decisionsExtractor,
  executeDecisions,
  executeCachedViewDecisions,
  showContainers
}) => {
  return ({ personalization, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    const viewName = personalization.getViewName();
    if (unprocessedDecisions.length === 0) {
      showContainers();
      return { decisions: [] };
    }

    const {
      schemaDecisions,
      otherDecisions
    } = decisionsExtractor.groupDecisionsBySchema({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    const {
      scopeDecisions,
      otherScopeDecisions
    } = decisionsExtractor.groupDecisionsByScope({
      decisions: schemaDecisions,
      scope: PAGE_WIDE_SCOPE
    });

    if (!isEmptyObject(otherScopeDecisions)) {
      viewCache.storeViews(otherScopeDecisions);
    }

    if (personalization.isRenderDecisions()) {
      executeDecisions(scopeDecisions);
      if (viewName) {
        executeCachedViewDecisions({ viewName });
      }
      showContainers();
      return { decisions: otherDecisions };
    }

    const decisionsToBeReturned = [...scopeDecisions, ...otherDecisions];

    if (viewName && otherScopeDecisions[viewName]) {
      decisionsToBeReturned.push(...otherScopeDecisions[viewName]);
    }

    return {
      decisions: decisionsToBeReturned
    };
  };
};
