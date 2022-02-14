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

import { selectNodes } from "../../../utils/dom";
import { STYLE } from "../../../constants/tagName";
import { SRC } from "../../../constants/elementAttribute";
import { getAttribute, getNonce } from "./dom";

const is = (element, tagName) => element.tagName === tagName;
const isInlineStyleElement = element =>
  is(element, STYLE) && !getAttribute(element, SRC);

export default fragment => {
  const styleNodes = selectNodes(STYLE, fragment);
  const { length } = styleNodes;
  const nonce = getNonce();
  if (!nonce) {
    return;
  }
  /* eslint-disable no-continue */
  for (let i = 0; i < length; i += 1) {
    const element = styleNodes[i];
    if (!isInlineStyleElement(element)) {
      continue;
    }
    element.nonce = nonce;
  }
};
