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

import isObject from "../isObject";
import assertValid from "./assertValid";

export default schema => (value, path) => {
  assertValid(isObject(value), value, path, "an object");
  const errors = [];

  const keyValidator = schema.key;
  const valueValidator = schema.value;

  const validatedMap = {};

  Object.keys(value).forEach(subKey => {
    try {
      const keySubPath = path ? `${path}.${subKey}` : subKey;
      const validatedKey = keyValidator(subKey, keySubPath);
      const validatedValue = valueValidator(value[subKey], keySubPath);

      if (validatedValue !== undefined) {
        validatedMap[validatedKey] = validatedValue;
      }
    } catch (e) {
      errors.push(e.message);
    }
  });

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  return validatedMap;
};
