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

import { truncateWhiteSpace } from "./utils.js";

const unsupportedNodeNames = /^(SCRIPT|STYLE|LINK|CANVAS|NOSCRIPT|#COMMENT)$/i;

/**
 * Determines if a node qualifies as a supported link text node.
 * @param {*} node Node to determine support for.
 * @returns {boolean}
 */
const isSupportedTextNode = (node) => {
  if (node && node.nodeName) {
    if (node.nodeName.match(unsupportedNodeNames)) {
      return false;
    }
  }
  return true;
};

/**
 * Orders and returns specified node and its child nodes in arrays of supported
 * and unsupported nodes.
 * @param {*} node The node to extract supported and unsupported nodes from.
 * @returns {{supportedNodes: Array, includesUnsupportedNodes: boolean}} Node support object.
 */
const extractSupportedNodes = (node) => {
  let supportedNodes = [];
  let includesUnsupportedNodes = false;
  if (isSupportedTextNode(node)) {
    supportedNodes.push(node);
    if (node.childNodes) {
      const childNodes = Array.prototype.slice.call(node.childNodes);
      childNodes.forEach((childNode) => {
        const nodes = extractSupportedNodes(childNode);
        supportedNodes = supportedNodes.concat(nodes.supportedNodes);
        includesUnsupportedNodes =
          includesUnsupportedNodes || nodes.includesUnsupportedNodes;
      });
    }
  } else {
    includesUnsupportedNodes = true;
  }
  return {
    supportedNodes,
    includesUnsupportedNodes,
  };
};

/**
 * Returns the value of a node attribute.
 * @param {*} node The node holding the attribute.
 * @param {string} attributeName The name of the attribute.
 * @param {string} nodeName Optional node name constraint.
 * @returns {string} Attribute value or undefined.
 */
const getNodeAttributeValue = (node, attributeName, nodeName) => {
  let attributeValue;
  if (!nodeName || nodeName === node.nodeName.toUpperCase()) {
    attributeValue = node.getAttribute(attributeName);
  }
  return attributeValue;
};

/**
 * Extracts the children supported nodes attributes map
 * @param {*} nodes The nodes array holding the children nodes.
 * The returned map contains the supported not empty children attributes values.
 * */
const getChildrenAttributes = (nodes) => {
  const attributes = {
    texts: [],
  };
  nodes.supportedNodes.forEach((supportedNode) => {
    if (supportedNode.getAttribute) {
      if (!attributes.alt) {
        attributes.alt = truncateWhiteSpace(supportedNode.getAttribute("alt"));
      }
      if (!attributes.title) {
        attributes.title = truncateWhiteSpace(
          supportedNode.getAttribute("title"),
        );
      }
      if (!attributes.inputValue) {
        attributes.inputValue = truncateWhiteSpace(
          getNodeAttributeValue(supportedNode, "value", "INPUT"),
        );
      }
      if (!attributes.imgSrc) {
        attributes.imgSrc = truncateWhiteSpace(
          getNodeAttributeValue(supportedNode, "src", "IMG"),
        );
      }
    }
    if (supportedNode.nodeValue) {
      attributes.texts.push(supportedNode.nodeValue);
    }
  });
  return attributes;
};

/**
 * Extracts a link-name from a given node.
 *
 * The returned link-name is set to one of the following (in order of priority):
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
 * @param {*} node The node to find link text for.
 * @returns {string} link-name or an empty string if not link-name is found.
 */
export default (node) => {
  let nodeText = truncateWhiteSpace(node.innerText || node.textContent);
  const nodes = extractSupportedNodes(node);
  // if contains unsupported nodes we want children node attributes
  if (!nodeText || nodes.includesUnsupportedNodes) {
    const attributesMap = getChildrenAttributes(nodes);
    nodeText = truncateWhiteSpace(attributesMap.texts.join(""));
    if (!nodeText) {
      nodeText =
        attributesMap.alt ||
        attributesMap.title ||
        attributesMap.inputValue ||
        attributesMap.imgSrc;
    }
  }
  return nodeText || "";
};
