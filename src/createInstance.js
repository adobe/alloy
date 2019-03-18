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

import nodeStyleCallbackify from "./utils/nodeStyleCallbackify";
import initializeComponents from "./initializeComponents";
import createDebugController from "./createDebugController";

// TODO: Replace with util once ready.
const isFunction = arg => typeof arg === "function";
const noop = () => {};

export default namespace => {
  const debugController = createDebugController(namespace);
  let componentRegistry;

  const debugCommand = ({ enabled }) => {
    debugController.debugEnabled = enabled;
  };

  function executeCommand(commandName, options = {}) {
    let command;

    if (commandName === "configure") {
      if (componentRegistry) {
        throw new Error(
          `${namespace}: The library has already been configured and may only be configured once.`
        );
      }
      command = config => {
        componentRegistry = initializeComponents(config, debugController);
      };
    } else {
      if (!componentRegistry) {
        throw new Error(
          `${namespace}: Please configure the library by calling ${namespace}("configure", {...}).`
        );
      }

      if (commandName === "debug") {
        command = debugCommand;
      } else {
        command = componentRegistry.getCommand(commandName);
      }
    }

    if (isFunction(command)) {
      const { callback = noop, ...otherOptions } = options;
      nodeStyleCallbackify(command)(otherOptions, callback);
    } else {
      throw new Error(
        `${namespace}: The command ${commandName} does not exist!`
      );
    }
  }

  return args => executeCommand(...args);
};
