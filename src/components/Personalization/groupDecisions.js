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

import { isNonEmptyArray, includes } from "../../utils";
import {
  DOM_ACTION,
  REDIRECT_ITEM,
  DEFAULT_CONTENT_ITEM,
  MEASUREMENT_SCHEMA
} from "./constants/schema";
import { VIEW_SCOPE_TYPE } from "./constants/scopeType";
import PAGE_WIDE_SCOPE from "./constants/scope";

const splitItems = (items, schemas) => {
  const matched = [];
  const nonMatched = [];

  items.forEach(item => {
    if (includes(schemas, item.schema)) {
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

const splitMergedMetricDecisions = decisions => {
  const matchedDecisions = decisions.filter(decision => {
    const { items = [] } = decision;
    return items.some(item => item.schema === MEASUREMENT_SCHEMA);
  });
  const unmatchedDecisions = decisions.filter(
    decision => !includes(matchedDecisions, decision)
  );
  return { matchedDecisions, unmatchedDecisions };
};

const splitDecisions = (decisions, ...schemas) => {
  const matchedDecisions = [];
  const unmatchedDecisions = [];

  decisions.forEach(decision => {
    const { items = [] } = decision;
    const [matchedItems, nonMatchedItems] = splitItems(items, schemas);

    if (isNonEmptyArray(matchedItems)) {
      matchedDecisions.push(createDecision(decision, matchedItems));
    }

    if (isNonEmptyArray(nonMatchedItems)) {
      unmatchedDecisions.push(createDecision(decision, nonMatchedItems));
    }
  });
  return { matchedDecisions, unmatchedDecisions };
};

const appendScopeDecision = (scopeDecisions, decision) => {
  if (!scopeDecisions[decision.scope]) {
    scopeDecisions[decision.scope] = [];
  }
  scopeDecisions[decision.scope].push(decision);
};

const isViewScope = scopeDetails =>
  scopeDetails.characteristics &&
  scopeDetails.characteristics.scopeType &&
  scopeDetails.characteristics.scopeType === VIEW_SCOPE_TYPE;

const extractDecisionsByScope = decisions => {
  const pageWideScopeDecisions = [];
  const nonPageWideScopeDecisions = [];
  const viewScopeDecisions = {};

  if (isNonEmptyArray(decisions)) {
    decisions.forEach(decision => {
      if (decision.scope === PAGE_WIDE_SCOPE) {
        pageWideScopeDecisions.push(decision);
      } else if (isViewScope(decision.scopeDetails)) {
        appendScopeDecision(viewScopeDecisions, decision);
      } else {
        nonPageWideScopeDecisions.push(decision);
      }
    });
  }

  return {
    pageWideScopeDecisions,
    nonPageWideScopeDecisions,
    viewScopeDecisions
  };
};

const groupDecisions = unprocessedDecisions => {
  // split redirect decisions
  const decisionsGroupedByRedirectItemSchema = splitDecisions(
    unprocessedDecisions,
    REDIRECT_ITEM
  );
  // split merged measurement decisions
  const mergedMetricDecisions = splitMergedMetricDecisions(
    decisionsGroupedByRedirectItemSchema.unmatchedDecisions
  );
  // split renderable decisions
  const decisionsGroupedByRenderableSchemas = splitDecisions(
    mergedMetricDecisions.unmatchedDecisions,
    DOM_ACTION,
    DEFAULT_CONTENT_ITEM
  );
  // group renderable decisions by scope
  const {
    pageWideScopeDecisions,
    nonPageWideScopeDecisions,
    viewScopeDecisions
  } = extractDecisionsByScope(
    decisionsGroupedByRenderableSchemas.matchedDecisions
  );

  return {
    redirectDecisions: decisionsGroupedByRedirectItemSchema.matchedDecisions,
    pageWideScopeDecisions,
    viewDecisions: viewScopeDecisions,
    nonAutoRenderableDecisions: [
      ...mergedMetricDecisions.matchedDecisions,
      ...decisionsGroupedByRenderableSchemas.unmatchedDecisions,
      ...nonPageWideScopeDecisions
    ]
  };
};
export default groupDecisions;
