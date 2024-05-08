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

import { isFunction, isObject } from "../utils/index.js";
import { CONFIGURE, SET_DEBUG } from "../constants/coreCommands.js";

export default ({
  logger,
  configureCommand,
  setDebugCommand,
  handleError,
  validateCommandOptions
}) => {
  let configurePromise;

  const getExecutor = (commandName, options) => {
    let executor;

    if (commandName === CONFIGURE) {
      if (configurePromise) {
        throw new Error(
          "The library has already been configured and may only be configured once."
        );
      }
      executor = () => {
        configurePromise = configureCommand(options);
        return configurePromise.then(() => {
          // Don't expose internals to the user.
        });
      };
    } else {
      if (!configurePromise) {
        throw new Error(
          `The library must be configured first. Please do so by executing the configure command.`
        );
      }
      if (commandName === SET_DEBUG) {
        executor = () => setDebugCommand(options);
      } else {
        executor = () => {
          return configurePromise.then(
            componentRegistry => {
              const command = componentRegistry.getCommand(commandName);
              if (!command || !isFunction(command.run)) {
                const commandNames = [CONFIGURE, SET_DEBUG]
                  .concat(componentRegistry.getCommandNames())
                  .join(", ");
                throw new Error(
                  `The ${commandName} command does not exist. List of available commands: ${commandNames}.`
                );
              }
              const validatedOptions = validateCommandOptions({
                command,
                options
              });
              return command.run(validatedOptions);
            },
            () => {
              logger.warn(
                `An error during configuration is preventing the ${commandName} command from executing.`
              );
              // If configuration failed, we prevent the configuration
              // error from bubbling here because we don't want the
              // configuration error to be reported in the console every
              // time any command is executed. Only having it bubble
              // once when the configure command runs is sufficient.
              // Instead, for this command, we'll just return a promise
              // that never gets resolved.
              return new Promise(() => {});
            }
          );
        };
      }
    }

    return executor;
  };

  return (commandName, options = {}) => {
    return new Promise(resolve => {
      // We have to wrap the getExecutor() call in the promise so the promise
      // will be rejected if getExecutor() throws errors.
      const executor = getExecutor(commandName, options);
      logger.logOnBeforeCommand({ commandName, options });
      resolve(executor());
    })
      .catch(error => {
        return handleError(error, `${commandName} command`);
      })
      .catch(error => {
        logger.logOnCommandRejected({ commandName, options, error });
        throw error;
      })
      .then(rawResult => {
        // We should always be returning an object from every command.
        const result = isObject(rawResult) ? rawResult : {};
        logger.logOnCommandResolved({ commandName, options, result });
        return result;
      });
  };
};
