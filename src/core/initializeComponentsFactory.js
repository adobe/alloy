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
    const { namespace } = createComponent;

    // TODO: Get the default config from the component
    // const { componentConfigSchema } = createComponent;
    // TODO: Extend the config with the component config schema

    const storage = getNamespacedStorage(
      "orgId." // TODO: Make orgId mandatory and add it here
    );
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

  // TODO: Output the finalized config schema (if debug is turned on)

  const lifecycle = createLifecycle(componentRegistry);
  lifecycle.onComponentsRegistered({
    componentRegistry,
    lifecycle
  });

  return componentRegistry;
};
