/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import isNil from "./isNil";
import filterObject from "./filterObject";
import isEmptyObject from "./isEmptyObject";
import isNonEmptyArray from "./isNonEmptyArray";
import isNonEmptyString from "./isNonEmptyString";
import isNumber from "./isNumber";
import isBoolean from "./isBoolean";

// We want to avoid mapping between specific keys because we want Konductor
// to be able to add overrides in the future without us needing to make
// any changes to the Web SDK
export default configuration => {
  if (isNil(configuration) || typeof configuration !== "object") {
    return null;
  }
  // remove entries that are empty strings or arrays
  const configOverrides = filterObject(configuration, value => {
    if (isNil(value)) {
      return false;
    }
    if (isBoolean(value)) {
      return true;
    }
    if (isNumber(value)) {
      return true;
    }
    if (isNonEmptyString(value)) {
      return true;
    }
    if (isNonEmptyArray(value)) {
      return true;
    }
    return false;
  });
  if (isEmptyObject(configOverrides)) {
    return null;
  }

  return configOverrides;
};
