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

import { matchesSelector } from "../../../../utils/dom/index.js";
import { isNotEqSelector } from "./helperForEq.js";
import { selectNodesWithEq } from "./selectNodesWithEq.js";

export default (selector, element) => {
  if (isNotEqSelector(selector)) {
    return matchesSelector(selector, element);
  }

  // Using node selection vs matches selector, because of :eq()
  // Find all nodes using document as context
  const nodes = selectNodesWithEq(selector);
  let result = false;

  // Iterate through all the identified elements
  // and reference compare with element
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i] === element) {
      result = true;
      break;
    }
  }

  return result;
};
