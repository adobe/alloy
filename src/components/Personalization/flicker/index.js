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

import { hash } from "../../../utils";
import {
  createNode,
  appendNode,
  removeNode,
  selectNodes
} from "../../../utils/dom";

const PREFIX = "alloy-";
const STYLE_TAG = "style";
const CLASS_ATTRIBUTE = "class";

const buildClassName = prehidingSelector => {
  return `${PREFIX}-${hash(prehidingSelector)}`;
};

export const prehideSelector = prehidingSelector => {
  const className = buildClassName(prehidingSelector);
  const node = createNode(STYLE_TAG, { [CLASS_ATTRIBUTE]: className });
  node.innerText = `${prehidingSelector} { visibility: hidden }`;

  appendNode(document.head, node);
};

export const removePrehiding = prehidingSelector => {
  const className = buildClassName(prehidingSelector);
  const nodes = selectNodes(`.${className}`);

  nodes.forEach(removeNode);
};
