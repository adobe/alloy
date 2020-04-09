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
  insertHtmlBefore,
  click,
  customCode
} from "../helper";

export default (collect, store) => {
  return {
    setHtml: createAction(collect, setHtml),
    customCode: createAction(collect, customCode),
    setText: createAction(collect, setText),
    setAttribute: createAction(collect, setAttributes),
    setImageSource: createAction(collect, swapImage),
    setStyle: createAction(collect, setStyles),
    move: createAction(collect, setStyles),
    resize: createAction(collect, setStyles),
    rearrange: createAction(collect, rearrangeChildren),
    remove: createAction(collect, removeNode),
    insertAfter: createAction(collect, insertHtmlAfter),
    insertBefore: createAction(collect, insertHtmlBefore),
    replaceHtml: createAction(collect, replaceHtml),
    prependHtml: createAction(collect, prependHtml),
    appendHtml: createAction(collect, appendHtml),
    click: settings => click(settings, store)
  };
};
