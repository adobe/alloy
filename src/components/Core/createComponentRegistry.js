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

const intersection = (a, b) => a.filter(x => b.includes(x));

export default () => {
  const components = [];
  const commandByName = {};

  return {
    register(component) {
      const { commands: componentCommandByName = {} } = component;

      const conflictingCommandNames = intersection(
        Object.keys(commandByName),
        Object.keys(componentCommandByName)
      );

      if (conflictingCommandNames.length) {
        throw new Error(
          `[ComponentRegistry] Could not register ${component.namespace} ` +
            `because it has existing command(s): ${conflictingCommandNames.join(
              ","
            )}`
        );
      }

      Object.assign(commandByName, componentCommandByName);
      components.push(component);
    },
    getByNamespace(namespace) {
      return components.find(component => component.namespace === namespace);
    },
    getAll() {
      // Slice so it's a copy of the original lest components
      // try to manipulate it. Maybe not that important.
      return components.slice();
    },
    getCommand(name) {
      return commandByName[name];
    }
  };
};
