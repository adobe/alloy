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

import { find, intersection, Promise, stackError } from "../utils";

const wrapForErrorHandling = (fn, stackMessage) => {
  return (...args) => {
    let result;

    try {
      result = fn(...args);
    } catch (error) {
      throw stackError(stackMessage, error);
    }

    if (result instanceof Promise) {
      result = result.catch(error => {
        throw stackError(stackMessage, error);
      });
    }

    return result;
  };
};

// TO-DOCUMENT: All public commands and their signatures.
export default () => {
  const componentsByNamespace = {};
  const commandsByName = {};
  const lifecycleCallbacksByName = {};

  const registerComponentCommands = (
    namespace,
    componentCommandsByName = {}
  ) => {
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

    Object.keys(componentCommandsByName).forEach(commandName => {
      const command = componentCommandsByName[commandName];
      commandsByName[commandName] = wrapForErrorHandling(
        command,
        `[${namespace}] An error occurred while executing the ${commandName} command.`
      );
    });
  };

  const registerLifecycleCallbacks = (
    namespace,
    componentLifecycleCallbacksByName = {}
  ) => {
    Object.keys(componentLifecycleCallbacksByName).forEach(hookName => {
      lifecycleCallbacksByName[hookName] =
        lifecycleCallbacksByName[hookName] || [];

      lifecycleCallbacksByName[hookName].push(
        wrapForErrorHandling(
          componentLifecycleCallbacksByName[hookName],
          `[${namespace}] An error occurred while executing the ${hookName} lifecycle hook.`
        )
      );
    });
  };

  return {
    register(namespace, component) {
      const { commands, lifecycle } = component;
      registerComponentCommands(namespace, commands);
      registerLifecycleCallbacks(namespace, lifecycle);
      componentsByNamespace[namespace] = component;
    },
    getNamespaceByComponent(component) {
      return find(Object.keys(componentsByNamespace), namespace => {
        return componentsByNamespace[namespace] === component;
      });
    },
    getCommand(commandName) {
      return commandsByName[commandName];
    },
    getLifecycleCallbacks(hookName) {
      return lifecycleCallbacksByName[hookName] || [];
    }
  };
};
