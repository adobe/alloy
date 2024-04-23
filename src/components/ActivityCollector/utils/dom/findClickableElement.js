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

import isSupportedAnchorElement from "./isSupportedAnchorElement";
import elementHasClickHandler from "./elementHasClickHandler";
import isInputSubmitElement from "./isInputSubmitElement";
import isButtonSubmitElement from "./isButtonSubmitElement";

export default element => {
  let node = element;
  while (node) {
    if (
      isSupportedAnchorElement(node) ||
      elementHasClickHandler(node) ||
      isInputSubmitElement(node) ||
      isButtonSubmitElement(node)
    ) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
};
