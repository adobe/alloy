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
  return { id: decision.id, scope: decision.scope, items };
};

const splitDecisions = (decisions, schema) => {
  const schemaDecisions = [];
  const otherDecisions = [];

  decisions.forEach(decision => {
    const { items = [] } = decision;
    const [matchedItems, nonMatchedItems] = splitItems(items, schema);

    if (isNonEmptyArray(matchedItems)) {
      schemaDecisions.push(createDecision(decision, matchedItems));
    }

    if (isNonEmptyArray(nonMatchedItems)) {
      otherDecisions.push(createDecision(decision, nonMatchedItems));
    }
  });
  return { schemaDecisions, otherDecisions };
};

const extractDecisionsByScope = (decisions, scope) => {
  const scopeDecisions = [];
  const otherScopeDecisions = {};

  if (isNonEmptyArray(decisions)) {
    decisions.forEach(decision => {
      if (decision.scope === scope) {
        scopeDecisions.push(decision);
      } else {
        if (!otherScopeDecisions[decision.scope]) {
          otherScopeDecisions[decision.scope] = [];
        }
        otherScopeDecisions[decision.scope].push(decision);
      }
    });
  }

  return { scopeDecisions, otherScopeDecisions };
};

export default {
  groupDecisionsBySchema({ decisions, schema }) {
    return splitDecisions(decisions, schema);
  },
  groupDecisionsByScope({ decisions, scope }) {
    return extractDecisionsByScope(decisions, scope);
  }
};
