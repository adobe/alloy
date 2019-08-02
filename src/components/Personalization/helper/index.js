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

import {
  getChildren,
  insertElementAfter,
  insertElementBefore,
  setAttribute,
  removeAttribute,
  setStyle,
  insertBefore,
  removeNode,
  preloadImage
} from "../../../utils/dom";
import { IMG, SRC } from "../../../utils/dom/constants";
import { showElements } from "../flicker";

export const createAction = (collect, renderFunc) => {
  return (settings, event) => {
    const { elements, prehidingSelector } = event;
    const { content, meta } = settings;

    // this is a very naive approach, we will expand later
    elements.forEach(element => {
      renderFunc(element, content);
    });

    // after rendering we should remove the flicker control styles
    showElements(prehidingSelector);

    // make sure we send back the metadata after successful rendering
    collect(meta);
  };
};

export const rearrangeChildren = (element, { from, to }) => {
  const children = getChildren(element);
  const elementFrom = children[from];
  const elementTo = children[to];

  if (!elementFrom || !elementTo) {
    // TODO: We will need to add logging
    // to ease troubleshooting
    return;
  }

  if (from < to) {
    insertElementAfter(elementTo, elementFrom);
  } else {
    insertElementBefore(elementTo, elementFrom);
  }
};

export const setAttributes = (element, attributes) => {
  Object.keys(attributes).forEach(key => {
    setAttribute(element, key, attributes[key]);
  });
};

export const setStyles = (element, styles) => {
  const { priority, ...style } = styles;

  Object.keys(style).forEach(key => {
    setStyle(element, key, style[key], priority);
  });
};

export const replace = (element, html) => {
  insertBefore(element, html);
  removeNode(element);
};

export const swapImage = (element, url) => {
  if (element.tagName !== IMG) {
    return;
  }

  // Start downloading the image
  preloadImage(url);

  // Remove "src" so there is no flicker
  removeAttribute(element, SRC);

  // Replace the image "src"
  setAttribute(element, SRC, url);
};

export const setHtml = (element, html) => {
  element.innerHTML = html;
};

export const setText = (element, text) => {
  element.textContent = text;
};
