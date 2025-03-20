/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { VIEW_SCOPE_TYPE } from "../constants/scopeType.js";
import { getAttribute, setAttribute } from "../dom-actions/dom/index.js";

/**
 * Creates a handler to manage the rendering status of elements in personalization
 *
 * @param {string} scopeType - The type of scope (e.g. 'view', 'page')
 * @param {string} itemId - The unique identifier for the item being rendered
 * @returns {Object} An object with methods to check and update rendering status
 * @returns {(element: Element) => boolean} Object.shouldRender - Function to determine if an element should be rendered
 * @returns {(element: Element) => void} Object.markAsRendered - Function to mark an element as rendered
 */
export default (scopeType, itemId) => {
  return {
    /**
     * Determines if an element should be rendered based on scopeType and previous render status
     *
     * @param {Element|null} element - The DOM element to check
     * @returns {boolean} True if the element should be rendered, false otherwise
     */
    shouldRender: (element) => {
      console.log("[CARTER] shouldRender", {
        element,
        scopeType,
        itemId,
        "data-aep-rendered": getAttribute(element, "data-aep-rendered"),
      });
      if (scopeType === VIEW_SCOPE_TYPE && element) {
        return getAttribute(element, "data-aep-rendered") !== itemId;
      }
      return true;
    },
    /**
     * Marks an element as rendered by setting a data attribute
     *
     * @param {Element} element - The DOM element to mark as rendered
     * @returns {void}
     */
    markAsRendered: (element) => {
      console.log("[CARTER] markAsRendered", {
        element,
        scopeType,
        itemId,
      });
      setAttribute(element, "data-aep-rendered", itemId);
    },
  };
};
