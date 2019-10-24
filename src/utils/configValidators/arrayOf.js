/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createExpected from "./createExpected";

const arrayExpected = createExpected("an array");
const elementExpected = createExpected(
  "all elements of the array to be defined"
);

export default elementValidator => (key, currentValue) => {
  return (
    arrayExpected(Array.isArray(currentValue), key, currentValue) ||
    currentValue.reduce((error, value, i) => {
      const arrayKey = `${key}[${i}]`;
      return (
        error ||
        elementExpected(value != null, arrayKey, value) ||
        elementValidator(arrayKey, value)
      );
    }, "")
  );
};
