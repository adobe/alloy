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

import getTypeSpecificHelpers from "./getTypeSpecificHelpers";
import { ENUM } from "../constants/schemaType";
/**
 * The model representing a node on the XDM tree.
 * @typedef {Object} TreeNode
 * @property {string} id A unique identifier for the node.
 * @property {string} displayName A user-friendly display for the node.
 * @property {string} type The JSON type that the node's value must be
 * @property {boolean} disabled Whether the user should be disallowed
 * from providing a value for the node.
 * @property {boolean} isPopulated Whether the node or one of its
 * descendants has been given a value.
 * @property {string} error If an error should be shown for the node,
 * this will be the error message.
 * @property {Array} children Children tree nodes, if any.
 * @property {string} infoTip The InfoTip to show on the node (if any)
 * @property {boolean} clear Whether the clear checkbox was ticked
 */

/**
 * Generates an object representing a node on the XDM tree. The node
 * may contain child nodes.
 * @param {FormStateNode} formStateNode A node from the form state.
 * @param {Function} treeNodeComponent A React component that renders a node
 * on the XDM tree.
 * @param {string} [displayName] A user-friendly display name for the node.
 * @param {boolean} [isAncestorUsingWholePopulationStrategy=false] Whether any ancestor
 * node is using the WHOLE population strategy. If this is true, this node will
 * be disabled.
 * @param {Function} [notifyParentOfTouched] When called, notifies the parent
 * node that the "whole value" field of this node or a descendant node has
 * been touched by the user. This helps determine if validation errors should
 * be shown for the node. "Touched" here is according to Formik's definition.
 * @param {Object} [errors] Errors that were collected during validation.
 * The structure of the errors object matches the structure of the
 * formStateNode, though only properties with errors will exist.
 * @param {Object} [touched] A record of which fields have been touched by
 * the user. The structure of the touched object matches the structure of
 * formStateNode. "Touched" here is according to Formik's definition.
 * @returns TreeNode
 */
const getTreeNode = ({
  formStateNode,
  treeNodeComponent,
  displayName,
  isAncestorUsingWholePopulationStrategy = false,
  notifyParentOfTouched = () => {},
  errors,
  touched,
  isAncestorCleared = false,
  showDisplayNames = false,
}) => {
  const { id, schema, isAlwaysDisabled } = formStateNode;

  const nodeDisplayName =
    showDisplayNames && schema.title ? schema.title : displayName || schema.key;

  const treeNode = {
    key: id,
    id,
    displayName: nodeDisplayName,
    type: schema.enum ? ENUM : schema.type,
    disabled: isAlwaysDisabled || isAncestorUsingWholePopulationStrategy,
    title: treeNodeComponent,
    clear: formStateNode.transform.clear && !isAncestorCleared,
  };

  // This variable keeps track of whether any of the errors have been
  // touched. This is imporant because we don't want to show errors
  // until the user has navigated away from the field at least once.
  let isTouchedAtCurrentOrDescendantNode = false;

  const confirmTouchedAtCurrentOrDescendantNode = () => {
    if (!isTouchedAtCurrentOrDescendantNode) {
      notifyParentOfTouched();
      isTouchedAtCurrentOrDescendantNode = true;
    }
  };

  if (
    touched &&
    touched.value === true &&
    errors &&
    typeof errors.value === "string"
  ) {
    // This case handles most of the data types. Other logic, such as within the
    // object-analytics and object-json types handle this within their
    // populateTreeNode functions.
    confirmTouchedAtCurrentOrDescendantNode();
  }

  getTypeSpecificHelpers(schema).populateTreeNode({
    treeNode,
    formStateNode,
    treeNodeComponent,
    isAncestorUsingWholePopulationStrategy,
    confirmTouchedAtCurrentOrDescendantNode,
    errors,
    touched,
    getTreeNode: ({ ...args }) => {
      return getTreeNode({
        ...args,
        isAncestorCleared: formStateNode.transform.clear || isAncestorCleared,
        showDisplayNames,
      });
    },
  });

  // To illustrate why we check for isTouchedAtCurrentOrDescendantNode,
  // if a user adds an item to an array node, we show an error if the
  // item is empty. However, we don't want to show the error until
  // we've given the user a chance to populate the item. For this reason,
  // we wait until the user has touched the node or its descendants or
  // has tried to save the data element (formik marks all fields as touched
  // upon save).
  if (isTouchedAtCurrentOrDescendantNode && errors) {
    treeNode.error =
      Object.keys(errors).length > 0
        ? "This field contains an error"
        : undefined;
  }

  return treeNode;
};

// Avoid exposing all of getTreeNode's parameters since
// they're only used internally for recursion.
export default ({
  treeNodeComponent,
  formState,
  errors,
  touched,
  showDisplayNames = false,
}) => {
  return getTreeNode({
    formStateNode: formState,
    treeNodeComponent,
    // Display name for the top-level node doesn't really
    // matter because it won't be shown in the tree anyway.
    displayName: "",
    errors,
    touched,
    showDisplayNames,
  });
};
