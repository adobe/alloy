/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createPreprocessors from "./createPreprocessors";
import { assign } from "../../utils";

export default ({ modules, preprocessors = createPreprocessors(), logger }) => {
  const logActionError = (action, error) => {
    if (logger.enabled) {
      const details = JSON.stringify(action);
      const { message, stack } = error;
      const errorMessage = `Failed to execute action ${details}. ${message} ${
        stack ? `\n ${stack}` : ""
      }`;

      logger.error(errorMessage);
    }
  };

  const logActionCompleted = action => {
    if (logger.enabled) {
      const details = JSON.stringify(action);

      logger.info(`Action ${details} executed.`);
    }
  };

  const getExecuteAction = (schema, type) => {
    if (!modules[schema] || !modules[schema][type]) {
      return () =>
        Promise.reject(
          new Error(`Action "${type}" not found for schema "${schema}"`)
        );
    }

    return modules[schema][type];
  };

  const applyPreprocessors = action => {
    const { schema } = action;

    const preprocessorsList = preprocessors[schema];

    if (
      !schema ||
      !(preprocessorsList instanceof Array) ||
      preprocessorsList.length === 0
    ) {
      return action;
    }

    return preprocessorsList.reduce(
      (processed, fn) => assign(processed, fn(processed)),
      action
    );
  };

  const executeAction = action => {
    const processedAction = applyPreprocessors(action);
    const { type, schema } = processedAction;

    const execute = getExecuteAction(schema, type);

    return execute(processedAction)
      .then(result => {
        logActionCompleted(processedAction);
        return result;
      })
      .catch(error => {
        logActionError(processedAction, error);
        throw error;
      });
  };

  return {
    executeAction
  };
};
