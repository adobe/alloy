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

import { removeNode } from "../../../utils/dom";
import setHtml from "./setHtml";
import prependHtml from "./prependHtml";
import { createAction } from "./action";
import setText from "./setText";
import setAttributes from "./setAttributes";
import swapImage from "./swapImage";
import setStyles from "./setStyles";
import rearrangeChildren from "./rearrangeChildren";
import insertHtmlAfter from "./insertHtmlAfter";
import insertHtmlBefore from "./insertHtmlBefore";
import replaceHtml from "./replaceHtml";
import appendHtml from "./appendHtml";
import collectInteractions from "./collectInteractions";

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

export default () => {
  return {
    [DOM_ACTION_SET_HTML]: createAction(setHtml),
    [DOM_ACTION_CUSTOM_CODE]: createAction(prependHtml),
    [DOM_ACTION_SET_TEXT]: createAction(setText),
    [DOM_ACTION_SET_ATTRIBUTE]: createAction(setAttributes),
    [DOM_ACTION_SET_IMAGE_SOURCE]: createAction(swapImage),
    [DOM_ACTION_SET_STYLE]: createAction(setStyles),
    [DOM_ACTION_MOVE]: createAction(setStyles),
    [DOM_ACTION_RESIZE]: createAction(setStyles),
    [DOM_ACTION_REARRANGE]: createAction(rearrangeChildren),
    [DOM_ACTION_REMOVE]: createAction(removeNode),
    [DOM_ACTION_INSERT_AFTER]: createAction(insertHtmlAfter),
    [DOM_ACTION_INSERT_BEFORE]: createAction(insertHtmlBefore),
    [DOM_ACTION_REPLACE_HTML]: createAction(replaceHtml),
    [DOM_ACTION_PREPEND_HTML]: createAction(prependHtml),
    [DOM_ACTION_APPEND_HTML]: createAction(appendHtml),
    [DOM_ACTION_COLLECT_INTERACTIONS]: createAction(collectInteractions)
  };
};
