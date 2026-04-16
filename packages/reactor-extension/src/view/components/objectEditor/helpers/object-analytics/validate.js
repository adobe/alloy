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

import { object } from "yup";
import analyticsForm from "./analyticsForm";

const validator = object().shape(analyticsForm.validationShape);

// Parse strings like "evars[1].evar" into objects like { evars: [undefined, { evar: "foo" }] }
const addValueToPath = (existing, path, value) => {
  let returnValue = existing;
  if (path[0] === "[") {
    const indexOfEndBracket = path.indexOf("]");
    const index = parseInt(path.slice(1, indexOfEndBracket), 10);
    if (!existing) {
      returnValue = [];
    }
    returnValue[index] = addValueToPath(
      returnValue[index],
      path.slice(indexOfEndBracket + 1),
      value,
    );
  } else if (path[0] === ".") {
    returnValue = addValueToPath(existing, path.slice(1), value);
  } else {
    if (!existing) {
      returnValue = {};
    }
    const indexOfDot = path.indexOf(".");
    const indexOfBracket = path.indexOf("[");
    if (indexOfDot === -1) {
      if (indexOfBracket === -1) {
        returnValue[path] = value;
      } else {
        const key = path.slice(0, indexOfBracket);
        returnValue[key] = addValueToPath(
          returnValue[key],
          path.slice(indexOfBracket),
          value,
        );
      }
    } else if (indexOfBracket === -1 || indexOfDot < indexOfBracket) {
      const key = path.slice(0, indexOfDot);
      returnValue[key] = addValueToPath(
        returnValue[key],
        path.slice(indexOfDot + 1),
        value,
      );
    } else {
      const key = path.slice(0, indexOfBracket);
      returnValue[key] = addValueToPath(
        returnValue[key],
        path.slice(indexOfBracket),
        value,
      );
    }
  }
  return returnValue;
};

export default ({ formStateNode }) => {
  let errors = {};

  try {
    validator.validateSync(formStateNode, { abortEarly: false });
  } catch (error) {
    error.inner.forEach(({ path, message }) => {
      errors = addValueToPath(errors, path, message);
    });
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  return undefined;
};
