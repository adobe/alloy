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

import extractModuleExports from "./extractModuleExports";

const getModule = (modules, referencePath) => {
  const module = modules[referencePath];

  if (!module) {
    throw new Error(`Module ${referencePath} not found.`);
  }

  return module;
};

const getModuleExports = (modules, referencePath) => {
  const module = getModule(modules, referencePath);

  /* eslint-disable no-prototype-builtins */
  if (!module.hasOwnProperty("exports")) {
    module.exports = extractModuleExports(module.script);
  }
  /* eslint-enable no-prototype-builtins */

  return module.exports;
};

export default modules => {
  return {
    getModuleDefinition: referencePath => {
      return modules[referencePath];
    },
    getModuleExports: referencePath => {
      return getModuleExports(modules, referencePath);
    },
    getModuleExtensionName: referencePath => {
      return modules[referencePath].extensionName;
    }
  };
};
