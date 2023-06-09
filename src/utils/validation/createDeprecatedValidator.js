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
import isObject from "../isObject";
import { assertValid } from "./utils";

export default (oldField, oldSchema, newField) =>
  function deprecated(value, path) {
    assertValid(isObject(value), value, path, "an object");

    const {
      [oldField]: oldValue,
      [newField]: newValue,
      ...otherValues
    } = value;
    const validatedOldValue = oldSchema(oldValue, path);

    if (validatedOldValue !== undefined) {
      let message = `The field '${oldField}' is deprecated. Use '${newField}' instead.`;
      if (path) {
        message = `'${path}': ${message}`;
      }
      if (newValue !== undefined && newValue !== validatedOldValue) {
        throw new Error(message);
      } else if (this && this.logger) {
        this.logger.warn(message);
      }
    }
    return {
      [newField]: newValue || validatedOldValue,
      ...otherValues
    };
  };
