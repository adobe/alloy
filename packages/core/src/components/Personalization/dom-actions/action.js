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

import { awaitSelector } from "../../../utils/dom/index.js";
import { hideElements, showElements } from "../flicker/index.js";
import { selectNodesWithEq } from "./dom/index.js";

export { default as setText } from "./setText.js";
export { default as setHtml } from "./setHtml.js";
export { default as appendHtml } from "./appendHtml.js";
export { default as prependHtml } from "./prependHtml.js";
export { default as replaceHtml } from "./replaceHtml.js";
export { default as insertHtmlBefore } from "./insertHtmlBefore.js";
export { default as insertHtmlAfter } from "./insertHtmlAfter.js";
export { default as setStyles } from "./setStyles.js";
export { default as setAttributes } from "./setAttributes.js";
export { default as swapImage } from "./swapImage.js";
export { default as rearrangeChildren } from "./rearrangeChildren.js";

/**
 * Renders content into a container element.
 *
 * @param {Object} params
 * @param {Element[]} params.containers
 * @param {string} params.content
 * @param {(element: Element) => void} params.decorateProposition
 * @param {(container: Element, content: string, decorateProposition: (element: Element) => void) => Promise<void>} params.renderFunc
 * @returns {Promise<void>} A promise that resolves when the content is rendered.
 */
const renderContent = ({
  containers,
  content,
  decorateProposition,
  renderFunc,
  renderStatusHandler,
}) => {
  const executions = containers
    .filter(renderStatusHandler.shouldRender)
    .map(async (container) => {
      await renderFunc(container, content, decorateProposition);
      renderStatusHandler.markAsRendered(container);
    });

  return Promise.all(executions);
};

/**
 * Creates an action function that renders content into a container element.
 *
 * @param {Function} renderFunc - The function that performs the rendering.
 */
export const createAction = (renderFunc) => {
  /**
   * Renders content into a container element.
   *
   * @param {{ selector: string, prehidingSelector: string, content: string }} itemData - The item data containing the container selector and prehiding selector.
   * @param {(element: Element) => void} createDecorateProposition
   * @param {{ shouldRender: (element: Element) => boolean, markAsRendered: (element: Element) => void }} renderStatusHandler
   */
  return async (itemData, decorateProposition, renderStatusHandler) => {
    const {
      selector: containerSelector,
      prehidingSelector,
      content,
    } = itemData;
    hideElements(prehidingSelector);
    try {
      const containers = await awaitSelector(
        containerSelector,
        selectNodesWithEq,
      );
      renderContent({
        containers,
        content,
        decorateProposition,
        renderFunc,
        renderStatusHandler,
      });
    } finally {
      showElements(prehidingSelector);
    }
  };
};
