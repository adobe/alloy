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

const DIV_TAG = "DIV";

const createFragment = content => {
  const result = document.createElement(DIV_TAG);
  result.innerHTML = content;

  return result;
};

const prependHtml = (container, content) => {
  const fragment = createFragment(content);
  const elements = [].slice.call(fragment.children);
  const { length } = elements;
  let i = length - 1;

  // We are inserting elements in reverse order
  while (i >= 0) {
    const element = elements[i];

    container.insertBefore(element, container.firstElementChild);

    i -= 1;
  }
};

export default collect => {
  return (settings, event) => {
    const { elements, prehidingSelector } = event;
    const { content, meta } = settings;

    // this is a very naive approach, we will expand later
    elements.forEach(element => {
      prependHtml(element, content);
    });

    // after rendering we should remove the flicker control styles
    showElements(prehidingSelector);

    // make sure we send back the metadata after successful rendering
    collect({ meta: { personalization: meta } });
  };
};
