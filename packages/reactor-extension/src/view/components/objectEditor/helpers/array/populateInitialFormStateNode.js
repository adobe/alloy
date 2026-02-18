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

import { PARTS, WHOLE } from "../../constants/populationStrategy";

export default ({
  formStateNode,
  value,
  nodePath,
  getInitialFormStateNode,
}) => {
  const { schema } = formStateNode;
  let itemFormStateNodes = [];
  formStateNode.isPartsPopulationStrategySupported = false;

  // Note if we aren't provided a schema for the array items (a case which
  // may not exist), we don't supported the PARTS population strategy.
  if (schema.items) {
    formStateNode.isPartsPopulationStrategySupported = true;

    const itemSchema = schema.items;
    if (formStateNode.items && formStateNode.items.length) {
      itemFormStateNodes = formStateNode.items.map((itemValue, index) => {
        return getInitialFormStateNode({
          schema: itemSchema,
          nodePath: nodePath !== "" ? `${nodePath}.${index}` : `${index}`,
          existingFormStateNode: itemValue,
        });
      });
    } else if (Array.isArray(value) && value.length) {
      itemFormStateNodes = value.map((itemValue, index) => {
        return getInitialFormStateNode({
          schema: itemSchema,
          value: itemValue,
          nodePath: nodePath !== "" ? `${nodePath}.${index}` : `${index}`,
        });
      });
    }
  }

  formStateNode.items = itemFormStateNodes;

  // If value is a string, we know that a data element token (e.g., "%foo%")
  // has been provided and the user is intending to use the WHOLE population strategy.
  // Otherwise, the user is using the PARTS population strategy (if a value exists) or
  // hasn't decided which strategy to use (if no value exists), in which case we'll
  // default to the PARTS population strategy if it's supported for the node.
  if (typeof value === "string") {
    formStateNode.populationStrategy = WHOLE;
    formStateNode.value = value;
  } else {
    formStateNode.populationStrategy =
      formStateNode.isPartsPopulationStrategySupported ? PARTS : WHOLE;
    formStateNode.value = "";
  }
};
