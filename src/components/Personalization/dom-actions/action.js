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

const renderContent = (elements, content, decorateProposition, renderFunc) => {
  const executions = elements.map((element) =>
    renderFunc(element, content, decorateProposition),
  );

  return Promise.all(executions);
};

export const createAction = (renderFunc) => {
  return (itemData, decorateProposition) => {
    const { selector, prehidingSelector, content } = itemData;

    hideElements(prehidingSelector);

    return awaitSelector(selector, selectNodesWithEq)
      .then((elements) =>
        renderContent(elements, content, decorateProposition, renderFunc),
      )
      .then(
        () => {
          // if everything is OK, show elements
          showElements(prehidingSelector);
        },
        (error) => {
          // in case of awaiting timing or error, we need to remove the style tag
          // hence showing the pre-hidden elements
          showElements(prehidingSelector);
          throw error;
        },
      );
  };
};
