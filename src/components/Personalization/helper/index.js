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
import {
  createFragment,
  getFirstChild,
  getChildren,
  getChildNodes,
  insertAfter,
  insertBefore,
  setAttribute,
  getAttribute,
  removeAttribute,
  setStyle,
  removeNode,
  appendNode,
  loadImage,
  selectNodes,
  createNode
} from "../../../utils/dom";
import { IMG, SRC, SCRIPT } from "../../../utils/dom/constants";
import { showElements } from "../flicker";

const is = (element, tagName) => element.tagName === tagName;
const isImage = element => is(element, IMG);
const isInlineScript = element =>
  is(element, SCRIPT) && !getAttribute(element, SRC);
const isRemoteScript = element =>
  is(element, SCRIPT) && getAttribute(element, SRC);

const clear = container => {
  // We want to remove ALL nodes, text, comments etc
  const childNodes = getChildNodes(container);

  childNodes.forEach(removeNode);
};

const loadImages = fragment => {
  const images = selectNodes(IMG, fragment);

  images.forEach(image => {
    const url = getAttribute(image, SRC);

    if (url) {
      loadImage(url);
    }
  });
};

const getInlineScripts = fragment => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;
  let i = 0;

  /* eslint-disable no-continue */
  for (i = 0; i < length; i += 1) {
    const element = scripts[i];

    if (!isInlineScript(element)) {
      continue;
    }

    const { textContent } = element;

    if (!textContent) {
      continue;
    }

    result.push(createNode(SCRIPT, {}, { textContent }));
  }
  /* eslint-enable no-continue */

  return result;
};

const getRemoteScriptsUrls = fragment => {
  const scripts = selectNodes(SCRIPT, fragment);
  const result = [];
  const { length } = scripts;
  let i = 0;

  /* eslint-disable no-continue */
  for (i = 0; i < length; i += 1) {
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

const executeInlineScripts = (container, fragment, func) => {
  const scripts = getInlineScripts(fragment);

  scripts.forEach(script => func(container, script));
};

const executeRemoteScripts = fragment => {
  const urls = getRemoteScriptsUrls(fragment);

  return Promise.all(urls.map(loadScript));
};

// Wrap in Promise to ensure
const wrapInPromise = func => {
  return (container, content) => {
    return Promise.resolve(func(container, content));
  };
};

export const createAction = (collect, renderFunc) => {
  return (settings, event) => {
    const { elements, prehidingSelector } = event;
    const { content, meta } = settings;
    const wrapperFunc = wrapInPromise(renderFunc);
    const executions = elements.map(element => wrapperFunc(element, content));

    return Promise.all(executions)
      .then(() => {
        // Success, unhide elements and notify
        showElements(prehidingSelector);
        collect(meta);
      })
      .catch(() => {
        // Something went horribly wrong, unhide elements
        showElements(prehidingSelector);
      });
  };
};

export const rearrangeChildren = (container, { from, to }) => {
  const children = getChildren(container);
  const elementFrom = children[from];
  const elementTo = children[to];

  if (!elementFrom || !elementTo) {
    // TODO: We will need to add logging
    // to ease troubleshooting
    return;
  }

  if (from < to) {
    insertAfter(elementTo, elementFrom);
  } else {
    insertBefore(elementTo, elementFrom);
  }
};

export const setAttributes = (container, attributes) => {
  Object.keys(attributes).forEach(key => {
    setAttribute(container, key, attributes[key]);
  });
};

export const swapImage = (container, url) => {
  if (!isImage(container)) {
    return;
  }

  // Start downloading the image
  loadImage(url);

  // Remove "src" so there is no flicker
  removeAttribute(container, SRC);

  // Replace the image "src"
  setAttribute(container, SRC, url);
};

export const setStyles = (container, styles) => {
  const { priority, ...style } = styles;

  Object.keys(style).forEach(key => {
    setStyle(container, key, style[key], priority);
  });
};

export const appendHtml = (container, html) => {
  const fragment = createFragment(html);
  const elements = getChildNodes(fragment);

  // We have to proactively load images to avoid flicker
  loadImages(fragment);

  elements.forEach(element => {
    appendNode(container, element);
  });

  executeInlineScripts(container, fragment, appendNode);

  return executeRemoteScripts(fragment);
};

export const setHtml = (container, html) => {
  clear(container);
  appendHtml(container, html);
};

export const insertHtmlAfter = (container, html) => {
  const fragment = createFragment(html);
  const elements = getChildNodes(fragment);

  // We have to proactively load images to avoid flicker
  loadImages(fragment);

  elements.forEach(element => {
    insertAfter(container, element);
  });

  executeInlineScripts(container, fragment, insertAfter);

  return executeRemoteScripts(fragment);
};

export const insertHtmlBefore = (container, html) => {
  const fragment = createFragment(html);
  const elements = getChildNodes(fragment);

  // We have to proactively load images to avoid flicker
  loadImages(fragment);

  elements.forEach(element => {
    insertBefore(container, element);
  });

  executeInlineScripts(container, fragment, insertBefore);

  return executeRemoteScripts(fragment);
};

export const prependHtml = (container, html) => {
  const fragment = createFragment(html);
  const elements = getChildNodes(fragment);
  const { length } = elements;
  let i = length - 1;

  // We have to proactively load images to avoid flicker
  loadImages(fragment);

  // We are inserting elements in reverse order
  while (i >= 0) {
    const element = elements[i];
    const firstChild = getFirstChild(container);

    insertBefore(firstChild, element);

    i -= 1;
  }

  executeInlineScripts(container, fragment, appendNode);

  return executeRemoteScripts(fragment);
};

export const replaceHtml = (container, html) => {
  insertHtmlBefore(container, html);
  removeNode(container);
};

export const setText = (container, text) => {
  container.textContent = text;
};
