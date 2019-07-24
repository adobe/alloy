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

import elementExists from "../events/elementExists";
import createSetHtml from "../actions/setHtml";
import createSetText from "../actions/setText";
import createSetAttribute from "../actions/setAttribute";
import createSetImageSource from "../actions/setImageSource";
import createSetStyle from "../actions/setStyle";
import createMove from "../actions/move";
import createResize from "../actions/resize";
import createRearrange from "../actions/rearrange";
import createRemove from "../actions/remove";
import createInsertAfter from "../actions/insertAfter";
import createInsertBefore from "../actions/insertBefore";
import createReplaceHtml from "../actions/replaceHtml";
import createPrependHtml from "../actions/prependHtml";

export default collect => {
  const setHtml = createSetHtml(collect);
  const setText = createSetText(collect);
  const setAttribute = createSetAttribute(collect);
  const setImageSource = createSetImageSource(collect);
  const setStyle = createSetStyle(collect);
  const move = createMove(collect);
  const resize = createResize(collect);
  const rearrange = createRearrange(collect);
  const remove = createRemove(collect);
  const insertAfter = createInsertAfter(collect);
  const insertBefore = createInsertBefore(collect);
  const replaceHtml = createReplaceHtml(collect);
  const prependHtml = createPrependHtml(collect);

  return {
    elementExists,
    setHtml,
    setText,
    setAttribute,
    setImageSource,
    setStyle,
    move,
    resize,
    rearrange,
    remove,
    insertAfter,
    insertBefore,
    replaceHtml,
    prependHtml
  };
};
