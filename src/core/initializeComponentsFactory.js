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

import createLifecycle from "./createLifecycle";
import createComponentRegistry from "./createComponentRegistry";
import { stackError } from "../utils";

export default (componentCreators, logger, getNamespacedStorage) => config => {
  const componentRegistry = createComponentRegistry();

  componentCreators.forEach(createComponent => {
    const { configValidators } = createComponent;
    config.addValidators(configValidators);
  });
  config.validate();
  componentCreators.forEach(createComponent => {
    const { namespace } = createComponent;
    const storage = getNamespacedStorage(config.orgID);
    // TO-DOCUMENT: Helpers that we inject into factories.
    let component;
    try {
      component = createComponent({
        logger: logger.spawn(`[${namespace}]`),
        config,
        storage
      });
    } catch (error) {
      throw stackError(
        `[${namespace}] An error occurred during component creation.`,
        error
      );
    }
    componentRegistry.register(namespace, component);
  });

  // Output the finalized configuration
  logger.info("Runtime configuration:\n", JSON.stringify(config, null, 2));

  const lifecycle = createLifecycle(componentRegistry);
  lifecycle.onComponentsRegistered({
    componentRegistry,
    lifecycle
  });

  return componentRegistry;
};
