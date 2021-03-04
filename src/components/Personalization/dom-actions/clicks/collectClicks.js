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

const metasToArray = metas => {
  return Object.keys(metas).map(key => {
    return {
      id: key,
      scope: metas[key]
    };
  });
};
const getMetasIfMatches = (clickedElement, selector, metas) => {
  const { documentElement } = document;
  let element = clickedElement;

  while (element && element !== documentElement) {
    if (matchesSelectorWithEq(selector, element)) {
      return metasToArray(metas);
    }

    element = element.parentNode;
  }

  return null;
};

export default (clickedElement, values) => {
  if (values.length === 0) {
    return [];
  }

  const result = [];
  const selectors = Object.keys(values);
  for (let i = 0; i < selectors.length; i += 1) {
    const metas = getMetasIfMatches(
      clickedElement,
      selectors[i],
      values[selectors[i]]
    );

    if (metas) {
      result.push(...metas);
    }
  }

  return result;
};
