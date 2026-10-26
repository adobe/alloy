/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isSupportedAnchorElement from "./isSupportedAnchorElement.js";
import elementHasClickHandler from "./elementHasClickHandler.js";
import isInputSubmitElement from "./isInputSubmitElement.js";
import isButtonSubmitElement from "./isButtonSubmitElement.js";

export type ClickableNode = Node &
  Partial<HTMLAnchorElement & HTMLInputElement & HTMLButtonElement> &
  Pick<HTMLInputElement, "getAttribute">;

export default (element: Node | null): ClickableNode | null => {
  let node = element as ClickableNode | null;
  while (node) {
    // Stop looking when BODY is reached
    if (node.nodeName && node.nodeName === "BODY") {
      break;
    }
    if (
      isSupportedAnchorElement(node) ||
      elementHasClickHandler(node) ||
      isInputSubmitElement(node) ||
      isButtonSubmitElement(node)
    ) {
      return node;
    }
    // parentNode can be a non-element such as document; the predicates above
    // check element properties structurally, so the cast is safe.
    node = node.parentNode as ClickableNode | null;
  }
  return null;
};
