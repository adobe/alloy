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

import { stackError, memoize, getTopLevelCookieDomain } from "../utils";
import cookieDetails from "../constants/cookieDetails";

const { ALLOY_COOKIE_NAME, ALLOY_COOKIE_TTL_IN_DAYS } = cookieDetails;

const memoizedGetTopLevelDomain = memoize(getTopLevelCookieDomain);

export default (
  componentCreators,
  logger,
  createNamespacedStorage,
  createCookieProxy,
  createCookie,
  createLifecycle,
  createComponentRegistry,
  createNetwork,
  createOptIn
) => config => {
  const componentRegistry = createComponentRegistry();
  const { imsOrgId, propertyId, cookieDomain } = config;
  const cookieName = `${ALLOY_COOKIE_NAME}_${propertyId}`;
  const cookieProxy = createCookieProxy(
    cookieName,
    ALLOY_COOKIE_TTL_IN_DAYS,
    cookieDomain || memoizedGetTopLevelDomain()
  );

  // TODO: Should this storage be namespaced by property ID or org ID?
  const storage = createNamespacedStorage(imsOrgId);
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
        cookie: createCookie(cookieProxy, namespace),
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
