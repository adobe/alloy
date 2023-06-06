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

export default schema =>
  function objectOf(value, path) {
    assertValid(isObject(value), value, path, "an object");

    // copy over unknown properties first
    const validatedObject = { ...value };
    const errors = {};
    const redoFields = {};
    const parent = new Proxy(value, {
      set(target, key, subValue) {
        redoFields[key] = true;
        return Reflect.set(target, key, subValue);
      }
    });
    const validateFields = keys => {
      keys.forEach(subKey => {
        if (redoFields[subKey]) {
          delete redoFields[subKey];
        }
        const subValue = value[subKey];
        const subSchema = schema[subKey];
        const subPath = path ? `${path}.${subKey}` : subKey;
        try {
          validatedObject[subKey] = subSchema.call(
            this,
            subValue,
            subPath,
            parent
          );
          if (validatedObject[subKey] === undefined) {
            delete validatedObject[subKey];
          }
          if (errors[subKey]) {
            delete errors[subKey];
          }
        } catch (e) {
          errors[subKey] = e.message;
        }
      });
    };

    validateFields(Object.keys(schema));
    // if one field changes another, we need to revalidate it
    while (Object.keys(redoFields).length) {
      validateFields(Object.keys(redoFields));
    }

    if (Object.keys(errors).length) {
      throw new Error(
        Object.keys(errors)
          .map(key => errors[key])
          .join("\n")
      );
    }
    return validatedObject;
  };
