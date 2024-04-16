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

import truncateWhiteSpace from "./utils/truncateWhiteSpace";
import { isNonEmptyString } from "../../utils";

const semanticElements = /^(HEADER|MAIN|FOOTER|NAV)$/i;

const getAriaRegionLabel = node => {
  let regionLabel;
  if (node.role === "region" && isNonEmptyString(node["aria-label"])) {
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
 * Extracts a node link-region.
 *
 * The link-region is determined by traversing up the DOM
 * looking for a region that is determined in order of priority:
 *
 * 1. element.id
 * 2. Aria region label
 * 3. Semantic element name
 * 4. BODY (if no other link-region is found).
 *
 * @param {*} node The node to find link region for.
 * @returns {string} link-region.
 */
export default node => {
  let linkParentNode = node.parentNode;
  let regionName;
  while (linkParentNode) {
    regionName = truncateWhiteSpace(
      linkParentNode.id ||
        getAriaRegionLabel(linkParentNode) ||
        getSectionNodeName(linkParentNode)
    );
    if (regionName) {
      return regionName;
    }
    linkParentNode = linkParentNode.parentNode;
  }
  return "BODY";
};
