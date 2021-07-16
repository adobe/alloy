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

import { isNonEmptyArray } from "../../utils";
import { DOM_ACTION, REDIRECT_ITEM } from "./constants/schema";
import PAGE_WIDE_SCOPE from "./constants/scope";

const splitItems = (items, schema) => {
  const matched = [];
  const nonMatched = [];

  items.forEach(item => {
    if (item.schema === schema) {
      matched.push(item);
    } else {
      nonMatched.push(item);
    }
  });

  return [matched, nonMatched];
};

const createDecision = (decision, items) => {
  return {
    id: decision.id,
    scope: decision.scope,
    items,
    scopeDetails: decision.scopeDetails
  };
};

const splitDecisions = (decisions, schema) => {
  const matchedDecisions = [];
  const unmatchedDecisions = [];

  decisions.forEach(decision => {
    const { items = [] } = decision;
    const [matchedItems, nonMatchedItems] = splitItems(items, schema);

    if (isNonEmptyArray(matchedItems)) {
      matchedDecisions.push(createDecision(decision, matchedItems));
    }

    if (isNonEmptyArray(nonMatchedItems)) {
      unmatchedDecisions.push(createDecision(decision, nonMatchedItems));
    }
  });
  return { matchedDecisions, unmatchedDecisions };
};

const extractDecisionsByScope = (decisions, scope) => {
  const pageWideScopeDecisions = [];
  const nonPageWideScopeDecisions = {};

  if (isNonEmptyArray(decisions)) {
    decisions.forEach(decision => {
      if (decision.scope === scope) {
        pageWideScopeDecisions.push(decision);
      } else {
        if (!nonPageWideScopeDecisions[decision.scope]) {
          nonPageWideScopeDecisions[decision.scope] = [];
        }
        nonPageWideScopeDecisions[decision.scope].push(decision);
      }
    });
  }

  return { pageWideScopeDecisions, nonPageWideScopeDecisions };
};

const groupDecisions = unprocessedDecisions => {
  const decisionsGroupedByRedirectItemSchema = splitDecisions(
    unprocessedDecisions,
    REDIRECT_ITEM
  );
  const decisionsGroupedByDomActionSchema = splitDecisions(
    decisionsGroupedByRedirectItemSchema.unmatchedDecisions,
    DOM_ACTION
  );

  const {
    pageWideScopeDecisions,
    nonPageWideScopeDecisions
  } = extractDecisionsByScope(
    decisionsGroupedByDomActionSchema.matchedDecisions,
    PAGE_WIDE_SCOPE
  );

  return {
    redirectDecisions: decisionsGroupedByRedirectItemSchema.matchedDecisions,
    pageWideScopeDecisions,
    viewDecisions: nonPageWideScopeDecisions,
    nonAutoRenderableDecisions:
      decisionsGroupedByDomActionSchema.unmatchedDecisions
  };
};
export default groupDecisions;
