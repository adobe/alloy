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

import {
  stackError,
  memoize,
  getTopLevelCookieDomain,
  cookieJar
} from "../utils";
import cookieDetails from "../constants/cookieDetails";

const { ALLOY_COOKIE_NAME, ALLOY_COOKIE_TTL_IN_DAYS } = cookieDetails;

const memoizedGetTopLevelDomain = memoize(getTopLevelCookieDomain);

export default ({
  componentCreators,
  logger,
  createCookieProxy,
  createComponentNamespacedCookieJar,
  lifecycle,
  componentRegistry,
  createNetwork,
  optIn
}) => config => {
  const network = createNetwork(config, logger, lifecycle);
  const { imsOrgId, cookieDomain } = config;
  const cookieName = `${ALLOY_COOKIE_NAME}_${imsOrgId}`;
  const cookieProxy = createCookieProxy(
    cookieName,
    ALLOY_COOKIE_TTL_IN_DAYS,
    cookieDomain || memoizedGetTopLevelDomain(window, cookieJar)
  );

  componentCreators.forEach(createComponent => {
    const { namespace, abbreviation } = createComponent;
    // TO-DOCUMENT: Helpers that we inject into factories.
    let component;
    try {
      component = createComponent({
        logger: logger.spawn(`[${namespace}]`),
        cookieJar: createComponentNamespacedCookieJar(
          cookieProxy,
          abbreviation
        ),
        config,
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

  return lifecycle
    .onComponentsRegistered({
      componentRegistry,
      lifecycle,
      network,
      optIn
    })
    .then(() => componentRegistry);
};
