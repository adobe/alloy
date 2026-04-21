/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Provides the IDs of nodes that should be expanded in the tree
 * based on validation errors. We want to expand the tree enough to show
 * all the nodes with errors.
 * @param {TreeNode} treeNode A tree node for which we determine should be expanded.
 * @param {Array} nodeIdsWithErrors The array we're augmenting which contains
 * IDs of nodes that should be expanded within the tree.
 * @returns {boolean} Whether the node or one of its descendants has an error.
 */
const populateNodeIdsContainingError = (treeNode, nodeIdsWithErrors) => {
  if (treeNode.children) {
    let descendantHasError = false;

    treeNode.children.forEach((childTreeNode) => {
      const nodeOrDescendantHasError = populateNodeIdsContainingError(
        childTreeNode,
        nodeIdsWithErrors,
      );
      descendantHasError = descendantHasError || nodeOrDescendantHasError;
    });

    if (descendantHasError) {
      nodeIdsWithErrors.push(treeNode.key);
      return true;
    }
  }

  return Boolean(treeNode.error);
};

export default (treeNode) => {
  const nodeIdsWithErrors = [];
  populateNodeIdsContainingError(treeNode, nodeIdsWithErrors);
  return nodeIdsWithErrors;
};
