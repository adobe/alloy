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

import createCore from "./components/Core";

import createTracker from "./components/Tracker";
import createIdentity from "./components/Identity";
import createAudiences from "./components/Audiences";
import createPersonalization from "./components/Personalization";
import createContext from "./components/Context";
import createComponentRegistry from "./components/Core/createComponentRegistry";

import nodeStyleCallbackify from "./utils/nodeStyleCallbackify";

// TODO: Replace with util once ready.
const isFunction = arg => typeof arg === "function";
const noop = () => {};

// MAYBE: Since we don't have a data layer yet, should we support a `configs.data`?
function configure(config) {
  // For now we are instantiating Core when configure is called.
  // TODO: Maybe pass those configs to a CoreConfig object that validates and wrap the raw configs.
  // TODO: Register the Components here statically for now. They might be registered differently.

  const componentRegistry = createComponentRegistry();

  componentRegistry.register(createTracker());
  componentRegistry.register(createIdentity());
  componentRegistry.register(createAudiences());
  componentRegistry.register(createPersonalization());
  componentRegistry.register(createContext());

  return createCore(config, componentRegistry);
}

export default namespace => {
  let core;

  function executeCommand(commandName, options = {}) {
    let command;

    if (commandName === "configure") {
      if (core) {
        throw new Error(
          `${namespace}: The library has already been configured and may only be configured once.`
        );
      }
      command = config => {
        core = configure(config);
      };
    } else {
      if (!core) {
        throw new Error(
          `${namespace}: Please configure the library by calling ${namespace}("configure", {...}).`
        );
      }
      command = core.components.getCommand(commandName);
    }

    if (isFunction(command)) {
      const { callback = noop, ...otherOptions } = options;
      nodeStyleCallbackify(command)(otherOptions, callback);
    } else {
      // TODO: Replace with real logger.
      console.warn(`The command: ${commandName} does not exist!`);
    }
  }

  return args => executeCommand(...args);
};
