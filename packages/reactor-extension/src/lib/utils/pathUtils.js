/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const IS_NUMBER_REGEX = /^-?[0-9]+$/;

const resolvePath = (path) => {
  return path
    .split(".")
    .map((pathElement) => {
      if (IS_NUMBER_REGEX.test(pathElement)) {
        return parseInt(pathElement, 10);
      }
      return pathElement;
    })
    .filter((pathElement) => pathElement !== "");
};

const toObject = (mixed) => {
  const obj = mixed || {};
  if (typeof obj !== "object") {
    return {};
  }
  return obj;
};

const toArray = (mixed) => {
  const array = mixed || [];
  if (!Array.isArray(array)) {
    return [];
  }
  return array;
};

const setValue = (parent, key, value) => {
  if (typeof key === "number") {
    const newArray = parent.slice();
    newArray[key] = value;
    return newArray;
  }
  return {
    ...parent,
    [key]: value,
  };
};

const deletePath = (parent, key) => {
  if (typeof key === "number") {
    return [...parent.slice(0, key), ...parent.slice(key + 1)];
  }
  const returnObject = {
    ...parent,
  };
  delete returnObject[key];
  return returnObject;
};

const run = (parent, key, path, i, onLeafNode) => {
  if (i === path.length) {
    return onLeafNode(parent, key);
  }

  let value;
  let pathElement = path[i];

  if (typeof pathElement === "number") {
    value = toArray(parent[key]);
    pathElement = pathElement < 0 ? value.length + pathElement : pathElement;
    pathElement = pathElement < 0 ? 0 : pathElement;
  } else {
    value = toObject(parent[key]);
  }
  return setValue(
    parent,
    key,
    run(value, pathElement, path, i + 1, onLeafNode),
  );
};

const createOperation = (onLeafNode) => (mixed, pathString, value) => {
  return run(
    { value: mixed },
    "value",
    resolvePath(pathString),
    0,
    (parent, key) => {
      return onLeafNode(parent, key, value);
    },
  ).value;
};

exports.setValue = createOperation(setValue);
exports.deletePath = createOperation(deletePath);
