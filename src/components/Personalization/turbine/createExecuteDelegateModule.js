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

import { isFunction } from "../../../utils";

const MODULE_NOT_FUNCTION_ERROR = "Module did not export a function.";

export default moduleProvider => {
  return (moduleDescriptor, syntheticEvent, moduleCallParameters = []) => {
    const moduleExports = moduleProvider.getModuleExports(
      moduleDescriptor.modulePath
    );

    if (!isFunction(moduleExports)) {
      throw new Error(MODULE_NOT_FUNCTION_ERROR);
    }

    const settings = moduleDescriptor.settings || {};

    /* eslint-disable prefer-spread */
    return moduleExports.bind(null, settings).apply(null, moduleCallParameters);
    /* eslint-enable prefer-spread */
  };
};
