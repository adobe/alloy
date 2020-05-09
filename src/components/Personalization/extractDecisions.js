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
import {
  getDecisions,
  isPageWideScope,
  isDomActionItem,
  isRedirectItem
} from "./utils";

const splitItems = (items, predicate) => {
  const matched = [];
  const nonMatched = [];

  items.forEach(item => {
    if (predicate(item)) {
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

const splitDecisions = (decisions, domActionPredicate, redirectPredicate) => {
  const domActionDecisions = [];
  const redirectDecisions = [];
  const otherDecisions = [];

  decisions.forEach(decision => {
    if (isPageWideScope(decision)) {
      const { items = [] } = decision;
      const [redirectItems, otherItems] = splitItems(items, redirectPredicate);
      const [matchedItems, nonMatchedItems] = splitItems(
        otherItems,
        domActionPredicate
      );

      if (isNonEmptyArray(redirectItems)) {
        redirectDecisions.push(createDecision(decision, redirectItems));
      }
      if (isNonEmptyArray(matchedItems)) {
        domActionDecisions.push(createDecision(decision, matchedItems));
      }

      if (isNonEmptyArray(nonMatchedItems)) {
        otherDecisions.push(createDecision(decision, nonMatchedItems));
      }
    } else {
      otherDecisions.push(decision);
    }
  });

  return [redirectDecisions, domActionDecisions, otherDecisions, decisions];
};

export default response => {
  const decisions = getDecisions(response);

  return splitDecisions(decisions, isDomActionItem, isRedirectItem);
};
