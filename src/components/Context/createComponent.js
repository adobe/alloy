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

import { deepAssign, flatMap, isString, isFunction } from "../../utils";

export default (config, logger, availableContexts, requiredContexts) => {
  let { context: configuredContexts } = config;

  if (!Array.isArray(configuredContexts)) {
    logger.warn("Invalid configured context. Please specify an array.");
    configuredContexts = [];
  }

  const contexts = flatMap(
    requiredContexts.concat(configuredContexts),
    context => {
      if (isString(context)) {
        if (availableContexts[context]) {
          return [availableContexts[context]];
        }
        logger.warn(`Invalid context: '${context}' is not available.`);
        return [];
      }
      if (isFunction(context)) {
        return [context];
      }
      logger.warn(`Invalid context: String or Function expected`);
      return [];
    }
  );

  return {
    namespace: "Context",
    lifecycle: {
      onBeforeEvent({ event }) {
        const xdm = {};
        contexts.forEach(context => {
          try {
            deepAssign(xdm, context(xdm));
          } catch (error) {
            logger.warn(error);
          }
        });
        event.mergeXdm(xdm);
      }
    }
  };
};
