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

import loadScript from "@adobe/reactor-load-script";
import { selectNodes, createNode } from "../../../utils/dom";
import { SRC, SCRIPT } from "../../../constants/tagName";
import { getAttribute, getNonce } from "./dom";

export const is = (element, tagName) =>
  !!element && element.tagName === tagName;

const isInlineScript = element =>
  is(element, SCRIPT) && !getAttribute(element, SRC);

const isRemoteScript = element =>
  is(element, SCRIPT) && getAttribute(element, SRC);

export const getInlineScripts = fragment => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;
  const nonce = getNonce();
  const attributes = {
    ...(nonce && { nonce })
  };

  /* eslint-disable no-continue */
  for (let i = 0; i < length; i += 1) {
    const element = scripts[i];

    if (!isInlineScript(element)) {
      continue;
    }

    const { textContent } = element;

    if (!textContent) {
      continue;
    }

    result.push(createNode(SCRIPT, attributes, { textContent }));
  }
  /* eslint-enable no-continue */

  return result;
};

export const getRemoteScriptsUrls = fragment => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;

  /* eslint-disable no-continue */
  for (let i = 0; i < length; i += 1) {
    const element = scripts[i];

    if (!isRemoteScript(element)) {
      continue;
    }

    const url = getAttribute(element, SRC);

    if (!url) {
      continue;
    }

    result.push(url);
  }
  /* eslint-enable no-continue */

  return result;
};

export const executeInlineScripts = (parent, scripts) => {
  scripts.forEach(script => {
    parent.appendChild(script);
    parent.removeChild(script);
  });
};

export const executeRemoteScripts = urls => {
  return Promise.all(urls.map(loadScript));
};
