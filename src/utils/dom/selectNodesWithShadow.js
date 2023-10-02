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

import querySelectorAll from "./querySelectorAll";
import startsWith from "../startsWith";
import SHADOW_SEPARATOR from "../../constants/shadowSeparator";

const splitWithShadow = selector => {
  return selector.split(SHADOW_SEPARATOR);
};

const transformPrefix = (parent, selector) => {
  const result = selector.trim();
  const hasChildCombinatorPrefix = startsWith(result, ">");
  if (!hasChildCombinatorPrefix) {
    return result;
  }

  const prefix =
    parent instanceof Element || parent instanceof HTMLDocument
      ? ":scope"
      : ":host"; // see https://bugs.webkit.org/show_bug.cgi?id=233380

  return `${prefix} ${result}`;
};

export default (context, selector) => {
  // Shadow DOM should be supported
  if (!window.document.documentElement.attachShadow) {
    return querySelectorAll(context, selector.replace(SHADOW_SEPARATOR, ""));
  }

  const parts = splitWithShadow(selector);

  if (parts.length < 2) {
    return querySelectorAll(context, selector);
  }

  // split the selector into parts separated by :shadow pseudo-selectors
  // find each subselector element based on the previously selected node's shadowRoot
  let parent = context;
  for (let i = 0; i < parts.length; i += 1) {
    const part = transformPrefix(parent, parts[i]);
    const partNode = querySelectorAll(parent, part);

    if (partNode.length === 0 || !partNode[0] || !partNode[0].shadowRoot) {
      return partNode;
    }

    parent = partNode[0].shadowRoot;
  }
  return undefined;
};
