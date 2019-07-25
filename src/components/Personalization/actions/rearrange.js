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
  insertElementBefore
} from "../../../utils/dom";
import { showElements } from "../flicker";

const rearrangeChildren = (element, from, to) => {
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
