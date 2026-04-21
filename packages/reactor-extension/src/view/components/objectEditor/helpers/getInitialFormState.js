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

import PropTypes from "prop-types";
import { WHOLE, PARTS } from "../constants/populationStrategy";
import defaultFormState from "../constants/defaultFormState";
import * as contextKey from "../constants/contextKey";
import * as autoPopulationSource from "../constants/autoPopulationSource";
import getTypeSpecificHelpers from "./getTypeSpecificHelpers";

let lastGeneratedNodeId = 0;
const generateNodeId = () => {
  lastGeneratedNodeId += 1;
  return `node-${lastGeneratedNodeId}`;
};

/**
 * The model representing a node within the form state.
 * @typedef {Object} FormStateNode
 * @property {string} id A unique identifier for the node.
 * @property {Object} schema The XDM schema for the node.
 * @property {string} autoPopulationSource The source of auto population for this node
 * @property {string} contextKey The context that could auto populate this field
 * @property {Object} properties If the schema type is "object"",
 * this will represent properties of the object as defined by the
 * schema. The keys are the property names and the values are their
 * respective form state nodes.
 * @property {Array} items If the schema type is "array"",
 * this will represent the items within the array as defined by
 * the user (the schema says what each item in an array must look like,
 * but the user adds the items to the array).
 * @property {boolean} isPartsPopulationStrategySupported Whether the
 * user should be able to populate parts of the node. In other words,
 * the node represents an object or an array and a schema has been
 * provided for the object's properties or the array's items.
 * @property {string} populationStrategy Indicates which population
 * strategy the user is taking to populate the node's value.
 * @property {string} value The value that a user has provided for
 * the whole node. This is only pertinent when the population strategy
 * is set to WHOLE. If the the user has set the population strategy to
 * PARTS, it will be ignored. We don't clear out value when the
 * user switches populationStrategy to PARTS, because the user might
 * switch back to WHOLE and we'd like to be able to show the value
 * they had previously entered.
 * @property {boolean} updateMode Whether the UI is in update mode.
 * This controls the clear existing value checkboxes.
 * @property {Object} transform Set of transforms to apply to this node. Currently
 * only clear: boolean is supported.
 * @property {string} nodePath The node path in dot notation.
 */

/**
 * Generates the initial form state. Note that parts of the state
 * aren't intended to be modified and have less to do with "values"
 * and more to do with constant metadata that corresponds to a
 * particular node (for example, the XDM schema that describes the node)
 * and is made available for convenient access so it doesn't have to
 * be repeatedly computed on every render.
 *
 * @param {Object} sandboxMeta The sandbox meta object.
 * @param {Object} schema The XDM schema that describes the node.
 * @param {*} [value] The previously persisted value for the node. This
 * will only be defined when the user is reloading the extension view
 * with previously saved data.
 * @param {string} [nodePath] The dot-delimited path to the node within
 * the schema. For example, in an object that looks like this:
 * <code>{ foo: { bar: "abc" } }</code>
 * The path for bar would be "foo.bar".
 * @returns FormStateNode
 */
const getInitialFormStateNode = ({
  schema,
  value,
  nodePath,
  updateMode,
  transforms,
  existingFormStateNode,
}) => {
  const formStateNode = {
    autoPopulationSource: autoPopulationSource.NONE,
    contextKey: contextKey.NA,
    ...defaultFormState[nodePath],
    // We generate an ID rather than use something like a schema path
    // or field path because those paths would need to incorporate indexes
    // of items, and indexes of items can change as items are removed
    // from their parent arrays. We want the ID to remain constant
    // for as long as the node exists.
    id: generateNodeId(),
    schema,
    updateMode,
    transform: transforms[nodePath] || { clear: false },
    nodePath,
  };

  if (existingFormStateNode) {
    formStateNode.properties = existingFormStateNode.properties;
    formStateNode.items = existingFormStateNode.items;
    // Keep the ids the same so that the expansion stays the same
    formStateNode.id = existingFormStateNode.id;
  }

  // Type specific helpers should set:
  //  - isPartsPopulationStrategySupported
  //  - populationStrategy
  //  - value
  //  - anything else needed for the specific type (e.g., "items" for array or "children" for object)
  getTypeSpecificHelpers(schema).populateInitialFormStateNode({
    formStateNode,
    value,
    nodePath,
    getInitialFormStateNode: ({ ...args }) => {
      return getInitialFormStateNode({ ...args, transforms, updateMode });
    },
    existingFormStateNode,
  });

  if (existingFormStateNode) {
    formStateNode.populationStrategy = existingFormStateNode.populationStrategy;
    formStateNode.value = existingFormStateNode.value;
  }

  return formStateNode;
};

// Avoid exposing all of getInitialFormStateNode's parameters since
// they're only used internally for recursion.
export default ({
  schema,
  value,
  updateMode = false,
  transforms = {},
  existingFormStateNode,
  nodePath = "",
}) => {
  return getInitialFormStateNode({
    schema,
    value,
    nodePath,
    updateMode,
    transforms,
    existingFormStateNode,
  });
};

const formStateNodeShape = {
  id: PropTypes.string.isRequired,
  schema: PropTypes.object,
  autoPopulationSource: PropTypes.string.isRequired,
  contextKey: PropTypes.string.isRequired,
  isPartsPopulationStrategySupported: PropTypes.bool.isRequired,
  value: PropTypes.any.isRequired,
  populationStrategy: PropTypes.oneOf([WHOLE, PARTS]).isRequired,
  updateMode: PropTypes.bool.isRequired,
  transform: PropTypes.shape({
    clear: PropTypes.bool.isRequired,
  }).isRequired,
  nodePath: PropTypes.string.isRequired,
};

export const formStateNodePropTypes = PropTypes.shape(formStateNodeShape);

// properties and items are recursive, which is why we have to do this weirdness.
// https://github.com/facebook/react/issues/5676
formStateNodeShape.properties = PropTypes.objectOf(formStateNodePropTypes);
formStateNodeShape.items = PropTypes.arrayOf(formStateNodePropTypes);
