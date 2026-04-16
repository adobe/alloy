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

import once from "once";
import getTypeSpecificHelpers from "./getTypeSpecificHelpers";

/**
 * Validates the user's XDM input.
 * @param {FormStateNode} formStateNode
 * @param {boolean} isParentAnArray Whether the parent node is an array type.
 * @param {Function} confirmDataPopulatedAtCurrentOrDescendantNode A function that should be called if
 * the current node or a descendant has been populated with a value.
 * @returns {Object} An errors object in the same structure as the formStateNode,
 * but where values within the object are any error messages that should be displayed.
 */
const validate = ({
  formStateNode,
  confirmDataPopulatedAtCurrentOrDescendantNode = () => {},
}) => {
  const { schema } = formStateNode;

  if (!schema) {
    return {};
  }
  const errors = getTypeSpecificHelpers(schema).validate({
    formStateNode,
    // By using "once", we ensure that the parent is notified that
    // data is populated at the current or descendant node at most
    // a single time. This is primarily for optimization but it's
    // also easier to reason about from the parent node's perspective.
    confirmDataPopulatedAtCurrentOrDescendantNode: once(
      confirmDataPopulatedAtCurrentOrDescendantNode,
    ),
    validate,
  });

  return errors;
};

// Avoid exposing all of validate's parameters since
// they're only used internally for recursion.
export default (formStateNode) => {
  return validate({ formStateNode });
};
