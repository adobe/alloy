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

import numberAwareCompareFunction from "../../../utils/numberAwareCompareFunction";

const pathSegmentRegex = /(.+?)([[.]|$)/;
const arrayNotationRegex = /^\[(\d*)\]$/;

const isNonNullObject = (item) => typeof item === "object" && item !== null;

const addVariablesFromEntity = (variables, prefix, value) => {
  if (Array.isArray(value)) {
    // If at least one item in the array is an object (which also includes
    // arrays), it's probably best to indicate the index for all items
    // because it's likely the user will be settings multiple properties on
    // at least one of the objects. In other words, these two results are
    // very different and we want to be explicit:
    //
    // Result 1
    // foo[0].bar
    // foo[0].baz
    //
    // Result 2
    // foo[].bar
    // foo[].baz
    const indicateIndex = value.some(isNonNullObject);

    value.forEach((item, index) => {
      addVariablesFromEntity(
        variables,
        `${prefix}[${indicateIndex ? index : ""}]`,
        item,
      );
    });
  } else if (isNonNullObject(value)) {
    Object.keys(value).forEach((key) => {
      addVariablesFromEntity(variables, `${prefix}.${key}`, value[key]);
    });
  } else if (value !== undefined && value !== null) {
    variables.push({
      key: prefix,
      value,
    });
  }
};

const addToEntityFromVariable = (parentNode, remainingPath, variableValue) => {
  const pathSegmentMatch = remainingPath.match(pathSegmentRegex);
  if (!pathSegmentMatch) {
    return;
  }

  // Given a remainingPath of foo.bar
  // key will be foo.
  // Given a remainingPath of foo[1].bar
  // key will be foo
  // Given a remainingPath of [1].bar
  // key will be [1]
  // Given a remainingPath of [].bar
  // key will be []
  const key = pathSegmentMatch[1];
  // Whether the key is something like [1]
  const keyArrayNotationMatch = key.match(arrayNotationRegex);

  // The path that will be passed when we call addValueForPathSegment again
  let childRemainingPath;
  let defaultValue;

  const characterAfterKey = pathSegmentMatch[2];
  if (characterAfterKey === "[") {
    childRemainingPath = remainingPath.substring(key.length);
    defaultValue = [];
  } else if (characterAfterKey === ".") {
    childRemainingPath = remainingPath.substring(key.length + 1);
    defaultValue = {};
  } else {
    childRemainingPath = remainingPath.substring(key.length);
    defaultValue = variableValue;
  }

  let node;

  if (keyArrayNotationMatch) {
    if (Array.isArray(parentNode)) {
      // The key uses array notation like [] or [1].
      // Get the index inside the key
      const index = keyArrayNotationMatch[1];
      if (index === "") {
        // An index doesn't exist, so we push.
        parentNode.push(defaultValue);
        node = defaultValue;
      } else {
        // If an index does exist, we set using the index.
        parentNode[index] = parentNode[index] || defaultValue;
        node = parentNode[index];
      }
    }
  } else {
    // The key doesn't use bracket notation
    parentNode[key] = parentNode[key] || defaultValue;
    node = parentNode[key];
  }

  if (childRemainingPath) {
    addToEntityFromVariable(node, childRemainingPath, variableValue);
  }
};

export const addToEntityFromVariables = (o, variables, { expandPaths }) => {
  if (expandPaths === false) {
    return variables.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  variables.forEach((q) => addToEntityFromVariable(o, q.key, q.value));
  return o;
};

export const addToVariablesFromEntity = (
  variables,
  entity,
  { expandPaths },
) => {
  if (expandPaths === false) {
    return Object.keys(entity)
      .sort(numberAwareCompareFunction)
      .reduce((acc, key) => {
        acc.push({ key, value: entity[key] });
        return acc;
      }, []);
  }

  Object.keys(entity).forEach((key) => {
    addVariablesFromEntity(variables, key, entity[key]);
  });

  return variables;
};
