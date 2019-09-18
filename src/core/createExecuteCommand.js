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

import { isFunction, toError, stringToBoolean, queryString } from "../utils";
import createConfig from "./createConfig";
import logQueryParam from "../constants/logQueryParam";
import { boolean } from "../utils/configValidators";

const coreConfigValidators = {
  errorsEnabled: {
    validate: boolean(),
    defaultValue: true
  },
  logEnabled: {
    validate: boolean(),
    defaultValue: false
  }
};

export default (
  namespace,
  initializeComponents,
  logController,
  logger,
  window
) => {
  // Assume errors are enabled until configuration says otherwise.
  let errorsEnabled = true;
  let configurePromise;

  const logCommand = ({ enabled }) => {
    // eslint-disable-next-line no-param-reassign
    logController.logEnabled = enabled;
    return Promise.resolve();
  };

  const configureCommand = options => {
    const config = createConfig(options);
    config.addValidators(coreConfigValidators);
    config.validate();
    ({ errorsEnabled } = config);
    logCommand({ enabled: config.logEnabled });
    const parsedQueryString = queryString.parse(window.location.search);
    if (parsedQueryString[logQueryParam] !== undefined) {
      logCommand({
        enabled: stringToBoolean(parsedQueryString[logQueryParam])
      });
    }
    return initializeComponents(config);
  };

  const getExecutor = (commandName, options) => {
    let execute;

    if (commandName === "configure") {
      if (configurePromise) {
        throw new Error(
          "The library has already been configured and may only be configured once."
        );
      }

      execute = () => {
        configurePromise = configureCommand(options);
        return configurePromise;
      };
    } else {
      if (!configurePromise) {
        throw new Error(
          `The library must be configured first. Please do so by calling ${namespace}("configure", {...}).`
        );
      }

      if (commandName === "log") {
        execute = () => logCommand(options);
      } else {
        execute = () => {
          return configurePromise.then(
            componentRegistry => {
              const command = componentRegistry.getCommand(commandName);
              if (!isFunction(command)) {
                throw new Error(`The ${commandName} command does not exist.`);
              }
              return command(options);
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

    return execute;
  };

  return (commandName, options = {}) => {
    return new Promise(resolve => {
      // We have to wrap the getExecutor() call in the promise so the promise
      // will be rejected if getExecutor() throws errors.
      const execute = getExecutor(commandName, options);
      logger.log(`Executing ${commandName} command.`, "Options:", options);
      resolve(execute());
    }).catch(error => {
      const err = toError(error);
      // eslint-disable-next-line no-param-reassign
      err.message = `[${namespace}] ${err.message}`;

      // If errors are enabled, we reject the promise we return
      // to the customer. If the customer catches the error
      // (using .catch()), the error won't hit the console.
      // If the customer doesn't catch the error, the error
      // will hit the console. This is due to how native
      // browser functionality handles unhandled errors.
      // If errors are NOT enabled, we instead pump the error
      // through our logger, in which case the error will
      // hit the console only if logging is enabled.
      if (errorsEnabled) {
        throw error;
      } else {
        logger.error(err);
      }
    });
  };
};
