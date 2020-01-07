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

import { boolean } from "../../utils/validation";
import { fireReferrerHideableImage } from "../../utils";
import processDestinationsFactory from "./processDestinationsFactory";

const getConfigOverrides = config => {
  const configOverrides = {};

  if (config.urlDestinationsEnabled !== undefined) {
    configOverrides.urlDestinationsEnabled = config.urlDestinationsEnabled;
  }
  if (config.cookieDestinationsEnabled !== undefined) {
    configOverrides.storedDestinationsEnabled =
      config.cookieDestinationsEnabled;
  }

  return Object.keys(configOverrides).length ? configOverrides : undefined;
};

const createAudiences = ({ config, logger }) => {
  const processDestinations = processDestinationsFactory({
    fireReferrerHideableImage,
    logger
  });
  return {
    lifecycle: {
      onBeforeEvent({ event, isViewStart, payload }) {
        if (isViewStart) {
          const configOverrides = getConfigOverrides(config);

          if (configOverrides) {
            event.expectResponse();
            payload.mergeConfigOverrides({
              activation: configOverrides
            });
          }
        }
      },
      onResponse({ response }) {
        const destinations = response.getPayloadsByType("activation:push");
        return processDestinations(destinations);
      }
    },
    commands: {}
  };
};

createAudiences.namespace = "Audiences";
createAudiences.configValidators = {
  cookieDestinationsEnabled: boolean(),
  urlDestinationsEnabled: boolean()
};

export default createAudiences;
