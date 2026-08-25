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
const NONCE = "nonce";
const NOMODULE = "nomodule";

// Per the HTML spec, a <script> only ever executes if its type is absent/
// empty, "module", or one of these recognized JavaScript MIME type essences
// (https://mimesniff.spec.whatwg.org/#javascript-mime-type). Any other type
// (e.g. "importmap", "application/json", a templating library's custom type)
// makes the element a data block: the browser never executes it, regardless
// of whether it's parsed from HTML, inserted via innerHTML, or appended with
// appendChild. Such elements are left untouched by this module — extracting
// and re-inserting them would be pointless at best, and at worst (if `type`
// were dropped along the way) would turn inert data into code that runs.
const JAVASCRIPT_MIME_TYPES = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
]);

// Attributes that affect how the script executes/fetches (as opposed to
// identity/presentation attributes like id, class, and data-*, which are
// intentionally not copied — see loadScript below). `src` is handled
// separately since it needs different treatment for inline vs. remote
// scripts, and `nonce` is copied here as a fallback but then overridden
// below with the page's current CSP nonce when one is found.
const COPIED_ATTRIBUTES = [
  TYPE,
  NONCE,
  "crossorigin",
  "integrity",
  "referrerpolicy",
  "fetchpriority",
  "nomodule",
];

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
  const script = document.createElement("script");
  // Only carry the attributes required to execute the script correctly:
  // `src` (below) and COPIED_ATTRIBUTES. Author attributes such as `id`,
  // `class`, and `data-*` are intentionally NOT copied: the original offer
  // <script> is left in the page (inert), so copying its id/class onto this
  // executed element would create duplicate matches for
  // document.getElementById / querySelector.
  COPIED_ATTRIBUTES.forEach((name) => {
    const value = getAttribute(source, name);
    if (value !== null) {
      script.setAttribute(name, value);
    }
  });
  // The page's current CSP nonce takes priority over whatever nonce (if any)
  // was written into the source markup, since that's the one the browser
  // will actually check against the CSP header for this page load.
  const nonce = getNonce();
  if (nonce) {
    script.setAttribute(NONCE, nonce);
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

// Normalizes away casing/whitespace/parameters (e.g. "TEXT/JAVASCRIPT ;
// charset=utf-8") so it can be compared against MODULE/JAVASCRIPT_MIME_TYPES.
const getNormalizedType = (element) => {
  const type = getAttribute(element, TYPE);
  return type ? type.split(";")[0].trim().toLowerCase() : "";
};

const isModule = (element) => getNormalizedType(element) === MODULE;

// A classic script per the HTML spec: type is absent/empty or a recognized
// JavaScript MIME type. Excludes "module" (handled separately) and anything
// else (data blocks like "importmap" or a templating library's custom type).
const isClassicJavaScript = (element) => {
  const type = getNormalizedType(element);
  return type === "" || JAVASCRIPT_MIME_TYPES.has(type);
};

// Gate applied before any inline/remote classification below: only scripts
// the browser would actually execute (classic JS or module) are eligible for
// extraction and re-insertion. Everything else is left untouched — it was
// never going to execute regardless of insertion method, so there's nothing
// to force.
const isExecutableScript = (element) =>
  is(element, SCRIPT) && (isClassicJavaScript(element) || isModule(element));

const isRemoteScript = (element) =>
  isExecutableScript(element) && !!getAttribute(element, SRC);

// An inline module (no src, type="module") executes asynchronously, so it is
// re-created in <head> alongside remote scripts rather than run synchronously
// in the offer container. It needs code to be worth executing.
const isInlineModuleScript = (element) =>
  isExecutableScript(element) &&
  !getAttribute(element, SRC) &&
  isModule(element) &&
  !!element.textContent;

// Classic inline scripts execute synchronously in the offer container. Inline
// module scripts are excluded here — they are handled as head scripts instead.
const isInlineScript = (element) =>
  isExecutableScript(element) &&
  !getAttribute(element, SRC) &&
  !isModule(element);

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

    // `nomodule` is preserved even though this element is force-executed via
    // appendChild: without it, a classic script the author intended as a
    // legacy fallback (skipped in module-supporting browsers) would run
    // where it otherwise wouldn't have.
    const nomodule = getAttribute(element, NOMODULE);
    result.push(
      createNode(
        SCRIPT,
        { ...attributes, ...(nomodule !== null && { nomodule }) },
        { textContent },
      ),
    );
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
