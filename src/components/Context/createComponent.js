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

export default (config, logger, availableContexts, requiredContexts) => {
  let configuredContexts;
  return {
    namespace: "Context",
    lifecycle: {
      onComponentsRegistered() {
        let configuredContextNames = [];

        if (Array.isArray(config.context)) {
          configuredContextNames = config.context;
        } else {
          logger.warn(
            `Invalid configured context. Please specify an array of strings.`
          );
        }

        configuredContexts = configuredContextNames
          .filter(configuredContextName => {
            if (!availableContexts[configuredContextName]) {
              logger.warn(
                `Configured context ${configuredContextName} is not available.`
              );
              return false;
            }
            return true;
          })
          .map(
            configuredContextName => availableContexts[configuredContextName]
          )
          .concat(requiredContexts);
      },
      onBeforeEvent(event) {
        configuredContexts.forEach(context => context(event));
      }
    }
  };
};
