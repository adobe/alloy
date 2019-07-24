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
import createNetwork from "./network";
import { stackError } from "../utils";
import createOptIn from "./createOptIn";

export default (
  componentCreators,
  logger,
  createNamespacedStorage,
  cookie
) => config => {
  const componentRegistry = createComponentRegistry();
  const { orgId, propertyId, cookieDomain } = config;
  const storage = createNamespacedStorage(orgId);
  const optIn = createOptIn();

  componentCreators.forEach(createComponent => {
    const { configValidators } = createComponent;
    config.addValidators(configValidators);
  });
  config.validate();
  componentCreators.forEach(createComponent => {
    const { namespace } = createComponent;
    // TO-DOCUMENT: Helpers that we inject into factories.
    let component;
    try {
      component = createComponent({
        logger: logger.spawn(`[${namespace}]`),
        cookie: cookie(namespace, propertyId, cookieDomain),
        config,
        storage,
        enableOptIn: optIn.enable
      });
    } catch (error) {
      throw stackError(
        `[${namespace}] An error occurred during component creation.`,
        error
      );
    }
    componentRegistry.register(namespace, component);
  });

  // toJson is expensive so we short circuit if logging is disabled
  if (logger.enabled) logger.log("Computed configuration:", config.toJSON());

  const lifecycle = createLifecycle(componentRegistry);
  const network = createNetwork(config, logger, lifecycle);
  lifecycle.onComponentsRegistered({
    componentRegistry,
    lifecycle,
    network,
    optIn
  });

  return componentRegistry;
};
