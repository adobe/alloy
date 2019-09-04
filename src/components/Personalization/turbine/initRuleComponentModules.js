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
import createRuleLoaded from "../events/ruleLoaded";
import {
  createAction,
  setHtml,
  setText,
  setAttributes,
  swapImage,
  setStyles,
  rearrangeChildren,
  replaceHtml,
  appendHtml,
  prependHtml,
  insertHtmlAfter,
  insertHtmlBefore
} from "../helper";

export default collect => {
  return {
    ruleLoaded: createRuleLoaded(collect),
    setHtml: createAction(setHtml),
    customCode: createAction(setHtml),
    setText: createAction(setText),
    setAttribute: createAction(setAttributes),
    setImageSource: createAction(swapImage),
    setStyle: createAction(setStyles),
    move: createAction(setStyles),
    resize: createAction(setStyles),
    rearrange: createAction(rearrangeChildren),
    remove: createAction(removeNode),
    insertAfter: createAction(insertHtmlAfter),
    insertBefore: createAction(insertHtmlBefore),
    replaceHtml: createAction(replaceHtml),
    prependHtml: createAction(prependHtml),
    appendHtml: createAction(appendHtml)
  };
};
