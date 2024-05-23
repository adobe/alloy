/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * Preprocess actions before rendering, so that offers are remapped to appendHtml when these are
 * to be applied to page HEAD, to align with the way it works in at.js.
 * Offer content should also be filtered, so that only tags allowed in HEAD are preserved.
 */

import { selectNodes } from "../../../utils/dom/index.js";
import { is } from "./scripts.js";
import { createFragment, selectNodesWithEq } from "./dom/index.js";
import { assign } from "../../../utils/index.js";
import isBlankString from "../../../utils/isBlankString.js";
import { HEAD } from "../../../constants/tagName.js";
import { DOM_ACTION_APPEND_HTML } from "./initDomActionsModules.js";

const HEAD_TAGS_SELECTOR = "SCRIPT,LINK,STYLE";

const filterHeadContent = (content) => {
  const container = createFragment(content);
  const headNodes = selectNodes(HEAD_TAGS_SELECTOR, container);
  return headNodes.map((node) => node.outerHTML).join("");
};

export default (action) => {
  const result = assign({}, action);
  const { content, selector } = result;

  if (isBlankString(content)) {
    return result;
  }

  if (selector == null) {
    return result;
  }

  const container = selectNodesWithEq(selector);
  if (!is(container[0], HEAD)) {
    return result;
  }

  result.type = DOM_ACTION_APPEND_HTML;
  result.content = filterHeadContent(content);

  return result;
};
