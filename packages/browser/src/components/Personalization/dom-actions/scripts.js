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

const TYPE = "type";
const MODULE = "module";

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

// Re-creates a script in <head> so the browser executes it (scripts inserted via
// innerHTML never run). Handles both remote scripts (with a src) and inline
// module scripts: an inline `type="module"` executes asynchronously and belongs
// with the head-loaded scripts rather than the synchronously-run inline path.
const loadScript = (source) => {
  const url = getAttribute(source, SRC);
  const type = getAttribute(source, TYPE);
  const script = document.createElement("script");
  // Only carry the attributes required to execute the script correctly: `type`
  // (e.g. "module"), `src` (below), and the CSP `nonce`. Author attributes such
  // as `id`, `class`, and `data-*` are intentionally NOT copied: the original
  // offer <script> is left in the page (inert), so copying its id/class onto
  // this executed element would create duplicate matches for
  // document.getElementById / querySelector.
  if (type) {
    script.setAttribute(TYPE, type);
  }
  const nonce = getNonce();
  if (nonce) {
    script.setAttribute("nonce", nonce);
  }

  if (!url) {
    // Inline module script: carry the code across and let it execute in <head>.
    // Inline scripts emit no load event, so completion cannot be tracked; we
    // resolve immediately and rely on the browser's deferred module execution.
    script.textContent = source.textContent;
    document.head.appendChild(script);
    return Promise.resolve(script);
  }

  script.src = url;
  script.async = true;
  const promise = getPromise(url, script);
  document.head.appendChild(script);
  return promise;
};

export const is = (element, tagName) =>
  !!element && element.tagName === tagName;

const isModule = (element) => getAttribute(element, TYPE) === MODULE;

const isRemoteScript = (element) =>
  is(element, SCRIPT) && !!getAttribute(element, SRC);

// An inline module (no src, type="module") executes asynchronously, so it is
// re-created in <head> alongside remote scripts rather than run synchronously
// in the offer container. It needs code to be worth executing.
const isInlineModuleScript = (element) =>
  is(element, SCRIPT) &&
  !getAttribute(element, SRC) &&
  isModule(element) &&
  !!element.textContent;

// Classic inline scripts execute synchronously in the offer container. Inline
// module scripts are excluded here — they are handled as head scripts instead.
const isInlineScript = (element) =>
  is(element, SCRIPT) && !getAttribute(element, SRC) && !isModule(element);

// Scripts that must be re-created in <head> to execute: remote scripts and
// inline module scripts.
const isHeadScript = (element) =>
  isRemoteScript(element) || isInlineModuleScript(element);

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

    if (!isHeadScript(element)) {
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
