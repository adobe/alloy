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

import { isFunction, toError } from "../utils";
import createConfig, { required } from "./createConfig";

const configValidators = {
  orgID: { validate: required() },
  propertyID: { validate: required() },
  dataSet: { validate: required() }
};

export default (namespace, initializeComponents, debugController) => {
  let componentRegistry;

  const debugCommand = ({ enabled }) => {
    // eslint-disable-next-line no-param-reassign
    debugController.debugEnabled = enabled;
  };

  const configureCommand = options => {
    if (options.debug !== undefined) {
      debugCommand({ enabled: options.debug });
    }
    const config = createConfig(options);
    config.addValidators(configValidators);
    componentRegistry = initializeComponents(config);
  };

  const executeCommand = (commandName, options) => {
    let command;

    if (commandName === "configure") {
      if (componentRegistry) {
        throw new Error(
          "The library has already been configured and may only be configured once."
        );
      }
      command = configureCommand;
    } else if (commandName === "debug") {
      command = debugCommand;
    } else {
      if (!componentRegistry) {
        throw new Error(
          `The library must be configured first. Please do so by calling ${namespace}("configure", {...}).`
        );
      }

      command = componentRegistry.getCommand(commandName);

      if (!isFunction(command)) {
        throw new Error(`The ${commandName} command does not exist.`);
      }
    }

    return command(options);
  };

  return args => {
    // Would use destructuring, but destructuring doesn't work on IE
    // without polyfilling Symbol.
    // https://github.com/babel/babel/issues/7597
    const resolve = args[0];
    const reject = args[1];
    const userProvidedArgs = args[2];
    const commandName = userProvidedArgs[0];
    const options = userProvidedArgs[1];

    // We have to wrap the function call in "new Promise()" instead of just
    // doing "Promise.resolve(executeCommand(commandName, options))" so that
    // the promise can capture any errors that occur synchronously during the
    // underlying function call.
    // Also note that executeCommand may or may not return a promise.
    new Promise(_resolve => {
      _resolve(executeCommand(commandName, options));
    })
      .then(resolve)
      .catch(error => {
        const err = toError(error);
        // eslint-disable-next-line no-param-reassign
        err.message = `[${namespace}] ${err.message}`;
        reject(err);
      });
  };
};
