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
import assertValid from "./assertValid";

const getNewFieldPath = (path, newField) => {
  const pathParts = path.split(".");
  pathParts[pathParts.length - 1] = newField;
  return pathParts.join(".");
};

export default newField =>
  function deprecated(value, path, context) {
    const newFieldPath = getNewFieldPath(path, newField);
    assertValid(
      !context[newField] || value === context[newField],
      value,
      path,
      `either '${path}' or '${newFieldPath}' to be set`
    );

    if (value) {
      if (this && this.logger) {
        this.logger.warn(
          `The field "${path}" is deprecated. Use "${newFieldPath}" instead.`
        );
      }
    }
    context[newField] = value;
    return undefined;
  };
