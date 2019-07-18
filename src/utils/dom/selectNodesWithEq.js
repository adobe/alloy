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

import isNonEmptyArray from "../isNonEmptyArray";
import isNonEmptyString from "../isNonEmptyString";
import selectNodes from "./selectNodes";

// ID and CSS classes can not start with digits
const DIGIT_IN_SELECTOR_PATTERN = /((\.|#)(-)?\d{1})/g;
// This is required to remove leading " > " from parsed pieces
const SIBLING_PATTERN = /^\s*>?\s*/;
const EQ_START = ":eq(";
const EQ_PATTERN = /:eq\((\d+)\)/g;

const cleanUp = str => str.replace(SIBLING_PATTERN, "").trim();
const isNotEqSelector = str => str.indexOf(EQ_START) === -1;

const createPair = match => {
  const first = match.charAt(0);
  const second = match.charAt(1);
  const third = match.charAt(2);
  const result = { key: match };

  if (second === "-") {
    result.val = `${first}${second}\\3${third} `;
  } else {
    result.val = `${first}\\3${second} `;
  }

  return result;
};

export const escapeDigitsInSelector = selector => {
  const matches = selector.match(DIGIT_IN_SELECTOR_PATTERN);

  if (isNonEmptyArray(matches)) {
    const pairs = matches.map(createPair);

    return pairs.reduce(
      (acc, pair) => acc.replace(pair.key, pair.val),
      selector
    );
  }

  return selector;
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
  let result = null;
  let context = doc;
  let i = 0;

  while (i < length) {
    const { sel, eq } = parts[i];
    const nodes = selectNodes(sel, context);

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
