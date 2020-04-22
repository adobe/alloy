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

import { awaitSelector } from "../../../utils/dom";
import { hideElements, showElements } from "../flicker";
import { selectNodesWithEq } from "./dom";

export { default as setText } from "./setText";
export { default as setHtml } from "./setHtml";
export { default as appendHtml } from "./appendHtml";
export { default as prependHtml } from "./prependHtml";
export { default as replaceHtml } from "./replaceHtml";
export { default as insertHtmlBefore } from "./insertHtmlBefore";
export { default as insertHtmlAfter } from "./insertHtmlAfter";
export { default as setStyles } from "./setStyles";
export { default as setAttributes } from "./setAttributes";
export { default as swapImage } from "./swapImage";
export { default as rearrangeChildren } from "./rearrangeChildren";
export { default as click } from "./click";

const renderContent = (elements, content, renderFunc) => {
  const executions = elements.map(element => renderFunc(element, content));

  return Promise.all(executions);
};

export const createAction = renderFunc => {
  return settings => {
    const { selector, prehidingSelector, content, meta } = settings;

    hideElements(prehidingSelector);

    return awaitSelector(selector, selectNodesWithEq)
      .then(elements => renderContent(elements, content, renderFunc))
      .then(
        () => {
          // if everything is OK, show elements
          showElements(prehidingSelector);
          return { meta };
        },
        error => {
          // in case of awaiting timing or error, we need to remove the style tag
          // hence showing the pre-hidden elements
          showElements(prehidingSelector);
          return { meta, error };
        }
      );
  };
};
