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

/** An element whose clicks the activity collector reports. */
export type ClickableElement =
  | HTMLAnchorElement
  | HTMLAreaElement
  | HTMLInputElement
  | HTMLButtonElement
  /** Any other element with an `onclick` handler. */
  | (Element & GlobalEventHandlers);

export default (element: Node | null): ClickableElement | null => {
  let node = element;
  while (node) {
    // Stop looking when BODY is reached
    if (node.nodeName === "BODY") {
      break;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const candidate = node as Element;
      if (
        isSupportedAnchorElement(candidate) ||
        elementHasClickHandler(candidate) ||
        isInputSubmitElement(candidate) ||
        isButtonSubmitElement(candidate)
      ) {
        // The checks above match on tag name or an onclick handler, which
        // are exactly the alternatives of ClickableElement.
        return candidate as ClickableElement;
      }
    }
    node = node.parentNode;
  }
  return null;
};
