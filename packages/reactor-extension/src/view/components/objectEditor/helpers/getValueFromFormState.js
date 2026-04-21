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

/**
 * Computes and returns the user-provided value from a form state node. If the
 * value is (1) an empty string (2) an object that has no properties with defined
 * values or (3) an array that has no items, undefined will be returned.
 * The purpose is to trim down the amount of cruft in the final computed value.
 *
 * @param {FormStateNode} formStateNode
 * @returns {*}
 */
const getValueFromFormState = ({
  formStateNode,
  transforms,
  isAncestorCleared = false,
}) => {
  const { schema, nodePath, transform } = formStateNode;
  const { clear } = transform || {};
  if (clear && !isAncestorCleared) {
    transforms[nodePath] = { clear: true };
  }
  if (!schema) {
    return {};
  }
  return getTypeSpecificHelpers(schema).getValueFromFormState({
    formStateNode,
    getValueFromFormState: ({ formStateNode: subFormStateNode }) => {
      return getValueFromFormState({
        formStateNode: subFormStateNode,
        transforms,
        isAncestorCleared: clear || isAncestorCleared,
      });
    },
  });
};

export default getValueFromFormState;
