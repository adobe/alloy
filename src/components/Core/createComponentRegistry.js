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

  const getListOfCommands = () =>
    components.reduce((all, c) => all.concat(Object.keys(c.commands)), []);

  function findExistingCommands(newComponent) {
    return intersection(
      getListOfCommands(),
      Object.keys(newComponent.commands || {})
    );
  }

  return {
    register(component) {
      const existingCommands = findExistingCommands(component);

      if (existingCommands.length) {
        throw new Error(
          `[ComponentRegistry] Could not register ${component.namespace} ` +
            `because it has existing command(s): ${existingCommands.join(",")}`
        );
      } else {
        components.push(component);
      }
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
      let command;

      components.some(component => {
        const isCommandFound = Object.keys(component.commands || {}).find(
          c => c === name
        );

        if (isCommandFound) {
          command = component.commands[name].bind(component);
          return true;
        }
        return false;
      });

      return command;
    }
  };
};
