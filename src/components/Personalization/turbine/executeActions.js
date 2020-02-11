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

const logActionError = (logger, action, error) => {
  if (logger.enabled) {
    const details = JSON.stringify(action);
    const { message, stack } = error;
    const errorMessage = `Failed to execute action ${details}. ${message} ${
      stack ? `\n ${stack}` : ""
    }`;

    logger.error(errorMessage);
  }
};

const logActionCompleted = (logger, action) => {
  if (logger.enabled) {
    const details = JSON.stringify(action);

    logger.log(`Action ${details} executed.`);
  }
};

const executeAction = (modules, type, args) => {
  const execute = modules[type];

  if (!execute) {
    throw new Error(`DOM action "${type}" not found`);
  }

  return execute(...args);
};

export default (actions, modules, logger) => {
  actions.forEach(action => {
    const { type } = action;

    try {
      executeAction(modules, type, [action]);
    } catch (e) {
      logActionError(logger, action, e);
      return;
    }

    logActionCompleted(logger, action);
  });
};
