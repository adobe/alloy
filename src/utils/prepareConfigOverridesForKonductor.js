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

const PREFIX = "com_adobe_";

// We want to avoid mapping between specific keys because we want Konductor
// to be able to add overrides in the future without us needing to make
// any changes to the Web SDK
export default configuration => {
  if (isNil(configuration) || typeof configuration !== "object") {
    return null;
  }
  // remove entries that are empty strings or arrays
  let configOverrides = filterObject(configuration, value => {
    if (isNil(value)) {
      return false;
    }
    if (typeof value === "boolean") {
      return true;
    }
    if (typeof value === "number") {
      return true;
    }
    if (typeof value === "string" && value !== "") {
      return true;
    }
    if (Array.isArray(value) && value.length > 0) {
      return true;
    }
    return false;
  });
  if (Object.values(configOverrides).length === 0) {
    return null;
  }

  // add "com_adobe_" to top level keys
  configOverrides = Object.entries(configOverrides).reduce(
    (result, [key, value]) => ({ ...result, [PREFIX + key]: value }),
    {}
  );

  return configOverrides;
};
