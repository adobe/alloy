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

import isNonEmptyString from "../isNonEmptyString";
import selectNodes from "./selectNodes";

// ID and CSS classes can not start with digits
const DIGIT_IN_SELECTOR_PATTERN = /(#|\.)(-)?(\d{1})(.*)/g;
// This is required to remove leading " > " from parsed pieces
const SIBLING_PATTERN = /^\s*>?\s*/;
const EQ_START = ":eq(";
const EQ_PATTERN = /:eq\((\d+)\)/g;

const cleanUp = str => str.replace(SIBLING_PATTERN, "").trim();
const isNotEqSelector = str => str.indexOf(EQ_START) === -1;

export const escapeDigitsInSelector = selector => {
  const replace = value =>
    value.replace(DIGIT_IN_SELECTOR_PATTERN, `$1$2\\3$3 $4`);

  return selector
    .split(" ")
    .filter(isNonEmptyString)
    .map(replace)
    .join(" ");
};

export const parseSelector = rawSelector => {
  const result = [];
  const selector = escapeDigitsInSelector(rawSelector.trim());
  const parts = selector.split(EQ_PATTERN).filter(isNonEmptyString);
  const { length } = parts;
  let i = 0;

  while (i < length) {
    const sel = cleanUp(parts[i]);
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
 * @param {Node} doc, defaults to document
 * @returns {Array} an array of DOM nodes
 */
export const selectNodesWithEq = (selector, doc = document) => {
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
