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

import { intersection, stackError } from "../utils/index.js";
import type {
  Component,
  ComponentCommand,
  ComponentLifecycle,
  LifecycleHookName,
} from "./types.js";

export type LifecycleCallback = (...args: unknown[]) => unknown;

/** A component command after registration. */
export interface RegisteredCommand {
  commandName: string;
  documentationUri?: string;
  optionsValidator?: (options: unknown) => unknown;
  run: (options: unknown) => unknown;
}

export interface ComponentRegistry {
  register: (namespace: string, component: Component) => void;
  getCommand: (commandName: string) => RegisteredCommand | undefined;
  getCommandNames: () => string[];
  getLifecycleCallbacks: (hookName: LifecycleHookName) => LifecycleCallback[];
  getComponentNames: () => string[];
}

const wrapForErrorHandling = (
  fn: (...args: never[]) => unknown,
  stackMessage: string,
) => {
  return (...args: unknown[]) => {
    let result: unknown;

    try {
      // Components type their own hook and command params; core passes them through.
      result = (fn as LifecycleCallback)(...args);
    } catch (error) {
      throw stackError({ error, message: stackMessage });
    }

    if (result instanceof Promise) {
      result = result.catch((error) => {
        throw stackError({ error, message: stackMessage });
      });
    }

    return result;
  };
};

// TO-DOCUMENT: All public commands and their signatures.
export default (): ComponentRegistry => {
  const componentsByNamespace: Record<string, Component> = {};
  const commandsByName: Record<string, RegisteredCommand> = {};
  const lifecycleCallbacksByName: Partial<
    Record<LifecycleHookName, LifecycleCallback[]>
  > = {};

  const registerComponentCommands = (
    namespace: string,
    componentCommandsByName: Record<string, ComponentCommand> = {},
  ) => {
    const conflictingCommandNames = intersection(
      Object.keys(commandsByName),
      Object.keys(componentCommandsByName),
    );

    if (conflictingCommandNames.length) {
      throw new Error(
        `[ComponentRegistry] Could not register ${namespace} ` +
          `because it has existing command(s): ${conflictingCommandNames.join(
            ",",
          )}`,
      );
    }

    Object.keys(componentCommandsByName).forEach((commandName) => {
      const command = componentCommandsByName[commandName];
      command.commandName = commandName;
      command.run = wrapForErrorHandling(
        command.run,
        `[${namespace}] An error occurred while executing the ${commandName} command.`,
      );
      // commandName is set and run is wrapped above.
      commandsByName[commandName] = command as RegisteredCommand;
    });
  };

  const registerLifecycleCallbacks = (
    namespace: string,
    componentLifecycleCallbacksByName: ComponentLifecycle = {},
  ) => {
    // The keys of a ComponentLifecycle are hook names.
    (
      Object.keys(componentLifecycleCallbacksByName) as LifecycleHookName[]
    ).forEach((hookName) => {
      lifecycleCallbacksByName[hookName] =
        lifecycleCallbacksByName[hookName] || [];

      lifecycleCallbacksByName[hookName].push(
        wrapForErrorHandling(
          // hookName is an own key, so the callback is defined.
          componentLifecycleCallbacksByName[hookName] as LifecycleCallback,
          `[${namespace}] An error occurred while executing the ${hookName} lifecycle hook.`,
        ),
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
    getCommand(commandName) {
      return commandsByName[commandName];
    },
    getCommandNames() {
      return Object.keys(commandsByName);
    },
    getLifecycleCallbacks(hookName) {
      return lifecycleCallbacksByName[hookName] || [];
    },
    getComponentNames() {
      return Object.keys(componentsByNamespace);
    },
  };
};
