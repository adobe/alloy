/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createElement } from "react";

const isCustomElement = (type) => {
  return /[A-Z]/.test(type.charAt(0));
};

const deserialize = (element, components) => {
  if (typeof element !== "object") {
    return element;
  }

  if (element === null) {
    return element;
  }

  if (element instanceof Array) {
    return element.map((el) => deserialize(el, components));
  }

  const { type, props, key } = element;

  if (typeof type !== "string") {
    throw new Error(
      `Element type must be string. Element type was ${JSON.stringify(type)}.`,
    );
  }

  let newType = type;

  if (isCustomElement(type)) {
    if (!components[type]) {
      throw new Error(
        `Component not found for ${type}. Be sure you've imported the component within the test fixture.`,
      );
    }

    newType = components[type];
  }

  const newProps = {
    ...props,
    key,
    children: props.children
      ? deserialize(props.children, components)
      : props.children,
  };

  return createElement(newType, newProps);
};

/**
 * This function receives an element object produced by React.createElement.
 * The element and its descendents are expected to all have strings for the
 * element type. For each element, the deserialization process looks to see
 * if a custom React component is available for the provided element type string.
 * If a component is found, the element type (which is a string) will be replaced
 * with the custom component function. This will allow React to render the element
 * using the proper custom components when the deserialized element is passed
 * into React.render.
 *
 * @param {Object} options.element The element object
 * (produced by React.createElement) to deserialize.
 * @param {Object} options.components The custom components available to be used by
 * the react element or its descendents. The keys are the element types
 * and the values are the corresponding component functions.
 */
const deserializeReactElement = ({ element, components }) => {
  return deserialize(element, components);
};

export default deserializeReactElement;
