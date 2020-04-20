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

import { createNode, appendNode, removeNode } from "../../../utils/dom";
import { STYLE } from "../../../constants/tagNames";
import { getElementById } from "../dom-actions/dom";

const PREHIDING_ID = "alloy-prehiding";
const HIDING_STYLE_DEFINITION = "{ visibility: hidden }";

// Using global is OK since we have a single DOM
// so storing nodes even for multiple Alloy instances is fine
const styleNodes = {};

export const hideElements = prehidingSelector => {
  // if we have different events with the same
  // prehiding selector we don't want to recreate
  // the style tag
  if (styleNodes[prehidingSelector]) {
    return;
  }

  const attrs = {};
  const props = {
    textContent: `${prehidingSelector} ${HIDING_STYLE_DEFINITION}`
  };
  const node = createNode(STYLE, attrs, props);

  appendNode(document.head, node);

  styleNodes[prehidingSelector] = node;
};

export const showElements = prehidingSelector => {
  const node = styleNodes[prehidingSelector];

  if (node) {
    removeNode(node);
    delete styleNodes[prehidingSelector];
  }
};

export const hideContainers = prehidingStyle => {
  if (!prehidingStyle) {
    return;
  }

  // If containers prehiding style has been added
  // by customer's prehiding snippet we don't
  // want to add the same node
  const node = getElementById(PREHIDING_ID);

  if (node) {
    return;
  }

  const attrs = { id: PREHIDING_ID };
  const props = { textContent: prehidingStyle };
  const styleNode = createNode(STYLE, attrs, props);

  appendNode(document.head, styleNode);
};

export const showContainers = () => {
  // If containers prehiding style exists
  // we will remove it
  const node = getElementById(PREHIDING_ID);

  if (!node) {
    return;
  }

  removeNode(node);
};
