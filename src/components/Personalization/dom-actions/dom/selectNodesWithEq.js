/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import escape from "css.escape";
import document from "../../../../utils/document";
import { selectNodes } from "../../../../utils/dom";
import { isNotEqSelector, splitWithEq } from "./helperForEq";

// Trying to match ID or CSS class
const CSS_IDENTIFIER_PATTERN = /(#|\.)(-?\w+)/g;
// Here we use CSS.escape() to make sure we get
// correct values for ID and CSS class
// Please check:  https://www.w3.org/TR/css-syntax-3/#escaping
// CSS.escape() polyfill can be found here: https://github.com/mathiasbynens/CSS.escape
const replaceIdentifier = (_, $1, $2) => `${$1}${escape($2)}`;

export const escapeIdentifiersInSelector = selector => {
  return selector.replace(CSS_IDENTIFIER_PATTERN, replaceIdentifier);
};

export const parseSelector = rawSelector => {
  const result = [];
  const selector = escapeIdentifiersInSelector(rawSelector.trim());
  const parts = splitWithEq(selector);
  const { length } = parts;
  let i = 0;

  while (i < length) {
    const sel = parts[i];
    const eq = parts[i + 1];

    if (eq) {
      result.push({ sel, eq: Number(eq) });
    } else {
      result.push({ sel });
    }

    i += 2;
  }

  return result;
};

/**
 * Returns an array of matched DOM nodes.
 * @param {String} selector that contains Sizzle "eq(...)" pseudo selector
 * @returns {Array} an array of DOM nodes
 */
export const selectNodesWithEq = selector => {
  const doc = document;

  if (isNotEqSelector(selector)) {
    return selectNodes(selector, doc);
  }

  const parts = parseSelector(selector);
  const { length } = parts;
  let result = [];
  let context = doc;
  let i = 0;

  while (i < length) {
    const { sel, eq } = parts[i];
    const nodes = selectNodes(sel, context);
    const { length: nodesCount } = nodes;

    if (nodesCount === 0) {
      break;
    }

    if (eq != null && eq > nodesCount - 1) {
      break;
    }

    if (i < length - 1) {
      if (eq == null) {
        [context] = nodes;
      } else {
        context = nodes[eq];
      }
    }

    if (i === length - 1) {
      if (eq == null) {
        result = nodes;
      } else {
        result = [nodes[eq]];
      }
    }

    i += 1;
  }

  return result;
};
