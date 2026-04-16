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
  getInitialFormStateNode,
  nodePath,
}) => {
  const { schema } = formStateNode;
  // Note if we aren't provided properties, we don't supported the
  // PARTS population strategy. The identityMap property on an
  // ExperienceEvent schema is one example of this.
  const { properties = {} } = schema;
  const propertyNames = Object.keys(properties);
  formStateNode.isPartsPopulationStrategySupported = false;

  if (propertyNames.length) {
    formStateNode.isPartsPopulationStrategySupported = true;
  }
  formStateNode.properties = propertyNames.reduce((memo, propertyName) => {
    const propertySchema = properties[propertyName];
    let propertyValue;

    if (typeof value === "object") {
      propertyValue = value[propertyName];
    }

    const propertyFormStateNode = getInitialFormStateNode({
      schema: propertySchema,
      value: propertyValue,
      nodePath: nodePath !== "" ? `${nodePath}.${propertyName}` : propertyName,
      existingFormStateNode: formStateNode.properties?.[propertyName],
    });
    memo[propertyName] = propertyFormStateNode;
    return memo;
  }, formStateNode.properties || {});

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
