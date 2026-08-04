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
import { selectNodes, createNode } from "@adobe/alloy-core/utils/dom";
import { SCRIPT } from "@adobe/alloy-core/constants/tagName.js";
import { SRC } from "@adobe/alloy-core/constants/elementAttribute.js";
import { getAttribute, getNonce } from "./dom/index.js";

const getPromise = (url, script) => {
  return new Promise((resolve, reject) => {
    script.onload = () => {
      resolve(script);
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
  });
};
const loadScript = (source) => {
  const url = getAttribute(source, SRC);
  const script = document.createElement("script");
  // Preserve all author-supplied attributes (class, type, data-*, etc.) so
  // consumers relying on them keep working.
  const { attributes } = source;
  for (let i = 0; i < attributes.length; i += 1) {
    const { name, value } = attributes[i];
    script.setAttribute(name, value);
  }
  // Override invariants last so they can't be clobbered by the source element.
  const nonce = getNonce();
  if (nonce) {
    script.setAttribute("nonce", nonce);
  }
  script.async = true;
  // Assign load handlers after copying attributes so a copied inline
  // onload/onerror attribute can't break load-completion tracking.
  const promise = getPromise(url, script);
  document.head.appendChild(script);
  return promise;
};

export const is = (element, tagName) =>
  !!element && element.tagName === tagName;

const isInlineScript = (element) =>
  is(element, SCRIPT) && !getAttribute(element, SRC);

const isRemoteScript = (element) =>
  is(element, SCRIPT) && getAttribute(element, SRC);

export const getInlineScripts = (fragment) => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;
  const nonce = getNonce();
  const attributes = {
    ...(nonce && { nonce }),
  };

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

  return result;
};

export const getRemoteScripts = (fragment) => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;

  for (let i = 0; i < length; i += 1) {
    const element = scripts[i];

    // isRemoteScript already requires a non-empty src attribute.
    if (!isRemoteScript(element)) {
      continue;
    }

    result.push(element);
  }

  return result;
};

export const executeInlineScripts = (parent, scripts) => {
  scripts.forEach((script) => {
    parent.appendChild(script);
    parent.removeChild(script);
  });
};

export const executeRemoteScripts = (scripts) => {
  return Promise.all(scripts.map(loadScript));
};
