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

import { intersection } from "../utils/lodashLike";

// TO-DOCUMENT: All public commands and their signatures.
export default () => {
  const componentsByNamespace = {};
  const commandsByName = {};

  return {
    register(namespace, component) {
      const { commands: componentCommandsByName = {} } = component;

      const conflictingCommandNames = intersection(
        Object.keys(commandsByName),
        Object.keys(componentCommandsByName)
      );

      if (conflictingCommandNames.length) {
        throw new Error(
          `[ComponentRegistry] Could not register ${namespace} ` +
            `because it has existing command(s): ${conflictingCommandNames.join(
              ","
            )}`
        );
      }

      Object.assign(commandsByName, componentCommandsByName);
      componentsByNamespace[namespace] = component;
    },
    getByNamespace(namespace) {
      return componentsByNamespace[namespace];
    },
    getAll() {
      return Object.values(componentsByNamespace);
    },
    getCommand(name) {
      return commandsByName[name];
    }
  };
};
