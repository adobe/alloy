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

import singleDataElementRegex from "../../../../constants/singleDataElementRegex";
import { addToEntityFromVariables } from "../entityVariablesConverter";
import { WHOLE } from "../../constants/populationStrategy";

export default ({ formStateNode }) => {
  const {
    value,
    items,
    populationStrategy,
    schema: { expandPaths },
  } = formStateNode;

  if (populationStrategy === WHOLE) {
    if (singleDataElementRegex.test(value)) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  let data = addToEntityFromVariables(
    {},
    items.filter((p) => p.key || p.value),
    {
      expandPaths,
    },
  );

  if (Object.keys(data).length === 0) {
    data = undefined;
  }

  return data;
};
