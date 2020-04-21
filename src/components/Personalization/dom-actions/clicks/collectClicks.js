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

import matchesSelectorWithEq from "../dom/matchesSelectorWithEq";

const collectIfMatches = (collect, clickedElement, value) => {
  const { documentElement } = document;
  const { selector, meta } = value;
  let element = clickedElement;

  while (element && element !== documentElement) {
    if (matchesSelectorWithEq(selector, element)) {
      collect(meta);
      break;
    }

    element = element.parentNode;
  }
};

export default (collect, clickedElement, values) => {
  if (values.length === 0) {
    return;
  }

  for (let i = 0; i < values.length; i += 1) {
    collectIfMatches(collect, clickedElement, values[i]);
  }
};
