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

import { removeNode } from "@adobe/alloy-core/utils/dom";
import setHtml from "./setHtml.js";
import prependHtml from "./prependHtml.js";
import { createAction, toDomActionModule } from "./action.js";
import type { DomActionModules } from "../types.js";
import setText from "./setText.js";
import setAttributes from "./setAttributes.js";
import swapImage from "./swapImage.js";
import setStyles from "./setStyles.js";
import move from "./move.js";
import rearrangeChildren from "./rearrangeChildren.js";
import insertHtmlAfter from "./insertHtmlAfter.js";
import insertHtmlBefore from "./insertHtmlBefore.js";
import replaceHtml from "./replaceHtml.js";
import appendHtml from "./appendHtml.js";
import collectInteractions from "./collectInteractions.js";
import resize from "./resize.js";

export const DOM_ACTION_SET_HTML = "setHtml";
export const DOM_ACTION_CUSTOM_CODE = "customCode";
export const DOM_ACTION_SET_TEXT = "setText";
export const DOM_ACTION_SET_ATTRIBUTE = "setAttribute";
export const DOM_ACTION_SET_IMAGE_SOURCE = "setImageSource";
export const DOM_ACTION_SET_STYLE = "setStyle";
export const DOM_ACTION_MOVE = "move";
export const DOM_ACTION_RESIZE = "resize";
export const DOM_ACTION_REARRANGE = "rearrange";
export const DOM_ACTION_REMOVE = "remove";
export const DOM_ACTION_INSERT_AFTER = "insertAfter";
export const DOM_ACTION_INSERT_BEFORE = "insertBefore";
export const DOM_ACTION_REPLACE_HTML = "replaceHtml";
export const DOM_ACTION_PREPEND_HTML = "prependHtml";
export const DOM_ACTION_APPEND_HTML = "appendHtml";
export const DOM_ACTION_CLICK = "click";
export const DOM_ACTION_COLLECT_INTERACTIONS = "collectInteractions";

export default (): DomActionModules => {
  return {
    [DOM_ACTION_SET_HTML]: toDomActionModule(createAction(setHtml, true)),
    [DOM_ACTION_CUSTOM_CODE]: toDomActionModule(
      createAction(prependHtml, true),
    ),
    [DOM_ACTION_SET_TEXT]: toDomActionModule(createAction(setText, true)),
    [DOM_ACTION_SET_ATTRIBUTE]: toDomActionModule(
      createAction(setAttributes, true),
    ),
    [DOM_ACTION_SET_IMAGE_SOURCE]: toDomActionModule(
      createAction(swapImage, true),
    ),
    [DOM_ACTION_SET_STYLE]: toDomActionModule(createAction(setStyles, true)),
    [DOM_ACTION_MOVE]: toDomActionModule(createAction(move, true)),
    [DOM_ACTION_RESIZE]: toDomActionModule(createAction(resize, true)),
    [DOM_ACTION_REARRANGE]: toDomActionModule(createAction(rearrangeChildren)),
    [DOM_ACTION_REMOVE]: toDomActionModule(createAction(removeNode, true)),
    [DOM_ACTION_INSERT_AFTER]: toDomActionModule(createAction(insertHtmlAfter)),
    [DOM_ACTION_INSERT_BEFORE]: toDomActionModule(
      createAction(insertHtmlBefore),
    ),
    [DOM_ACTION_REPLACE_HTML]: toDomActionModule(
      createAction(replaceHtml, true),
    ),
    [DOM_ACTION_PREPEND_HTML]: toDomActionModule(createAction(prependHtml)),
    [DOM_ACTION_APPEND_HTML]: toDomActionModule(createAction(appendHtml)),
    [DOM_ACTION_COLLECT_INTERACTIONS]: toDomActionModule(
      createAction(collectInteractions, true),
    ),
  };
};
