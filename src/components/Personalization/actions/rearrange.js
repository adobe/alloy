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

import { showElements } from "../flicker";

const COMMENT_NODE = 8;

const toArray = elements => [].slice.call(elements);
const notComment = element => element.nodeType !== COMMENT_NODE;

const rearrangeChildren = (element, from, to) => {
  const children = toArray(element.children).filter(notComment);
  const elementFrom = children[from];
  const elementTo = children[to];

  if (!elementFrom || !elementTo) {
    // TODO: We will need to add logging
    // to ease troubleshooting
    return;
  }

  if (from < to) {
    element.insertBefore(elementFrom, elementTo.nextElementSibling);
  } else {
    element.insertBefore(elementFrom, elementTo);
  }
};

export default collect => {
  return (settings, event) => {
    const { elements, prehidingSelector } = event;
    const { content, meta } = settings;
    const { from, to } = content;

    elements.forEach(element => {
      rearrangeChildren(element, from, to);
    });

    // after rendering we should remove the flicker control styles
    showElements(prehidingSelector);

    // make sure we send back the metadata after successful rendering
    collect({ meta: { personalization: meta } });
  };
};
