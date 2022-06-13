/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isEmptyString, truncateWhiteSpace } from "./utils";

const semanticElements = /^(HEADER|MAIN|FOOTER|NAV)$/i;

const getAriaRegionLabel = node => {
  let regionLabel;
  if (node.role === "region" && !isEmptyString(node["aria-label"])) {
    regionLabel = node["aria-label"];
  }
  return regionLabel;
};

const getSectionNodeName = node => {
  let nodeName;
  if (node && node.nodeName) {
    if (node.nodeName.match(semanticElements)) {
      nodeName = node.nodeName;
    }
  }
  return nodeName;
};

/**
 * Extracts a link-region from a given node.
 *
 * The returned link-region is set to one of the following (in order of priority):
 *
 * TODO: Update this list with the correct logic.
 *
 * 1. Clicked node innerText
 * 2. Clicked node textContent
 * 3. Clicked node and its child nodes nodeValue appended together.
 * 4. Clicked node alt attribute or node descendant alt attribute.
 *    Whichever is found first.
 * 5. Clicked node text attribute or node descendant text attribute.
 *    Whichever is found first.
 * 6. Clicked node INPUT descendant value attribute.
 *    Whichever is found first.
 * 7. Clicked node IMG descendant src attribute.
 *    Whichever is found first.
 *
 * @param {*} node The node to find link region for.
 * @returns {string} link-region or BODY if no link-region is found.
 */
export default targetElement => {
  let node = targetElement.parentNode;
  let regionName;
  while (node) {
    regionName = truncateWhiteSpace(
      node.id || getAriaRegionLabel(node) || getSectionNodeName(node)
    );
    if (regionName) {
      return regionName;
    }
    node = node.parentNode;
  }
  return "BODY";
};
