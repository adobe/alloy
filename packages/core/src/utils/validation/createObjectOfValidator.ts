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

import isObject from "../isObject.js";
import { assertValid } from "./utils.js";
import type { ObjectValidatorSchema, ValidatorFn } from "./types.js";

export default (schema: ObjectValidatorSchema) =>
  function objectOf(
    this: unknown,
    value: Record<string, unknown>,
    path?: string,
  ): Record<string, unknown> {
    assertValid(isObject(value), value, path, "an object");

    const errors: string[] = [];
    const validatedObject: Record<string, unknown> = {};
    Object.keys(schema).forEach((subKey) => {
      const subValue = value[subKey];
      const subSchema = (schema as Record<string, ValidatorFn>)[subKey];
      const subPath = path ? `${path}.${subKey}` : subKey;
      try {
        const validatedValue = subSchema.call(this, subValue, subPath);
        if (validatedValue !== undefined) {
          validatedObject[subKey] = validatedValue;
        }
      } catch (e) {
        errors.push((e as Error).message);
      }
    });

    // copy over unknown properties
    Object.keys(value).forEach((subKey) => {
      if (!Object.prototype.hasOwnProperty.call(validatedObject, subKey)) {
        validatedObject[subKey] = value[subKey];
      }
    });

    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return validatedObject;
  };
