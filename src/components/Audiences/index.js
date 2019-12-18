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

import { boolean } from "../../utils/configValidators";
import { fireReferrerHideableImage } from "../../utils";
import processDestinationsFactory from "./processDestinationsFactory";

const createAudiences = ({ config, logger }) => {
  const processDestinations = processDestinationsFactory({
    fireReferrerHideableImage,
    logger
  });
  return {
    lifecycle: {
      onBeforeEvent({ event, isViewStart }) {
        if (isViewStart) {
          event.mergeMeta({
            activation: {
              urlDestinationsEnabled: config.urlDestinationsEnabled,
              storedDestinationsEnabled: config.cookieDestinationsEnabled
            }
          });
          event.expectResponse();
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
  cookieDestinationsEnabled: {
    defaultValue: true,
    validate: boolean()
  },
  urlDestinationsEnabled: {
    defaultValue: true,
    validate: boolean()
  }
};

export default createAudiences;
