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

import {
  createNode,
  appendNode,
  removeNode,
  findById
} from "../../../utils/dom";

const CONTAINERS_HIDING_ID = "alloy-prehiding";
const HIDING_STYLE_DEFINITION = "{ visibility: hidden }";
const STYLE_TAG = "style";
const CACHE = {};

export const hideElements = prehidingSelector => {
  // if we have different events with the same
  // prehiding selector we don't want to recreate
  // the style tag
  if (CACHE[prehidingSelector]) {
    return;
  }

  const node = createNode(STYLE_TAG, {
    text: `${prehidingSelector} ${HIDING_STYLE_DEFINITION}`
  });

  appendNode(document.head, node);

  CACHE[prehidingSelector] = node;
};

export const showElements = prehidingSelector => {
  const node = CACHE[prehidingSelector];

  if (node) {
    removeNode(node);
  }
};

export const hideContainers = prehidingStyle => {
  if (!prehidingStyle) {
    return;
  }

  // If containers prehiding style has been added
  // by customer's prehiding snippet we don't
  // want to add the same node
  const node = findById(CONTAINERS_HIDING_ID);

  if (node) {
    return;
  }

  const styleNode = createNode(STYLE_TAG, {
    id: CONTAINERS_HIDING_ID,
    text: prehidingStyle
  });

  appendNode(document.head, styleNode);
};

export const showContainers = () => {
  // If containers prehiding style exists
  // we will remove it
  const node = findById(CONTAINERS_HIDING_ID);

  if (!node) {
    return;
  }

  removeNode(node);
};
